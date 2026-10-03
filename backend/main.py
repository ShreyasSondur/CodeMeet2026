import os
import io
import re
import uuid
import time
import secrets
import random
import hmac
import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from fastapi import FastAPI, HTTPException, Header, Depends, Query, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from pydantic import BaseModel, EmailStr, field_validator
from dotenv import load_dotenv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import razorpay

from database import (
    init_db,
    save_registration,
    get_stats,
    get_registrations,
    delete_registration,
    get_event_pricings,
    get_event_pricing,
    update_event_pricing
)
from email_service import send_admin_otp_email

load_dotenv()

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "idontknow")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", os.getenv("SMTP_EMAIL", "admin@codemeet.com"))
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_TjUjaEkXrem1Yo")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "6Bs9uraea30uFMlFH7NoQt4n")

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# In-memory secure state for 2FA OTPs and active admin sessions
otp_store: Dict[str, Any] = {}
active_sessions: Dict[str, float] = {}

app = FastAPI(
    title="CodeMeet 2026 API",
    description="Backend API with Razorpay Standard Checkout & 2FA Admin for CodeMeet 2026",
    version="1.3.0"
)

# Initialize database
init_db()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File uploads and rulebook directory configuration
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
RULEBOOK_META_FILE = os.path.join(UPLOADS_DIR, "rulebook_meta.json")

def get_rulebook_meta() -> Dict[str, Any]:
    if os.path.exists(RULEBOOK_META_FILE):
        try:
            with open(RULEBOOK_META_FILE, "r", encoding="utf-8") as f:
                meta = json.load(f)
                file_path = os.path.join(UPLOADS_DIR, meta.get("saved_filename", ""))
                if os.path.exists(file_path):
                    size = os.path.getsize(file_path)
                    meta["exists"] = True
                    meta["size_bytes"] = size
                    meta["size_formatted"] = f"{size / (1024 * 1024):.2f} MB" if size >= 1024*1024 else f"{size / 1024:.1f} KB"
                    return meta
        except Exception:
            pass
    return {
        "exists": False,
        "filename": "CODEMEET_2026_Official_Rulebook.pdf",
        "size_bytes": 0,
        "size_formatted": "0 KB",
        "updated_at": None,
        "is_default": True
    }

# Pydantic Schemas
class MemberSchema(BaseModel):
    name: str
    email: str
    phone: str
    is_leader: Optional[bool] = False

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = re.sub(r"\D", "", v or "")
        if len(clean) != 10:
            raise ValueError("Phone number must be exactly 10 digits (numbers only)")
        return clean

class RegistrationRequest(BaseModel):
    event_id: str
    event_name: str
    team_name: Optional[str] = ""
    college_name: str
    members: List[MemberSchema]
    is_solo: Optional[bool] = False
    payment_id: Optional[str] = ""
    amount_paid: Optional[str] = "1"

class CreateOrderRequest(BaseModel):
    amount: Optional[int] = None  # in paise, if not provided will fetch from dynamic event pricing
    currency: Optional[str] = "INR"
    receipt: Optional[str] = None
    event_id: Optional[str] = "hackathon"
    college_name: Optional[str] = ""

class UpdateEventPricingRequest(BaseModel):
    event_id: str
    amount_inr: float

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    # Optional registration data to persist upon verification
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    team_name: Optional[str] = ""
    college_name: Optional[str] = None
    members: Optional[List[MemberSchema]] = None
    is_solo: Optional[bool] = False
    amount_paid: Optional[str] = "1"

class RequestOTPRequest(BaseModel):
    password: str

class VerifyOTPRequest(BaseModel):
    password: str
    otp: str

def mask_email(email: str) -> str:
    if "@" not in email:
        return "admin email"
    user, domain = email.split("@", 1)
    if len(user) <= 2:
        masked_user = user[0] + "*"
    else:
        masked_user = user[0] + "*" * (len(user) - 2) + user[-1]
    return f"{masked_user}@{domain}"

def verify_admin_auth(
    x_admin_token: Optional[str] = Header(None, alias="x-admin-token"),
    authorization: Optional[str] = Header(None)
):
    token = x_admin_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing security token")

    now = time.time()
    if token in active_sessions:
        if active_sessions[token] > now:
            return True
        else:
            del active_sessions[token]
            raise HTTPException(status_code=401, detail="Session expired. Please re-authenticate.")

    raise HTTPException(status_code=401, detail="Unauthorized: Invalid security session token")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CodeMeet 2026 Backend API (Razorpay Standard Checkout + 2FA Protected)",
        "version": "1.3.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "FastAPI backend is running and connected successfully!",
        "version": "1.3.0"
    }

# ==========================================
# EVENT PRICING ENDPOINTS
# ==========================================
@app.get("/api/events/pricing")
def get_all_event_pricings():
    """Public endpoint to fetch current live pricing for all events"""
    pricings = get_event_pricings()
    return {
        "success": True,
        "pricing": pricings
    }

@app.put("/api/admin/events/pricing")
def admin_update_pricing(
    data: UpdateEventPricingRequest,
    authorized: bool = Depends(verify_admin_auth)
):
    """Admin endpoint to update event entry fee dynamically (Protected by 2FA)"""
    if data.amount_inr < 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Entry fee cannot be less than ₹1.00"
        )
    
    updated = update_event_pricing(data.event_id, data.amount_inr)
    return {
        "success": True,
        "message": f"Entry fee for {updated['event_name']} updated to ₹{updated['amount_inr']:.2f}",
        "pricing": updated
    }

# ==========================================
# RULEBOOK MANAGEMENT ENDPOINTS
# ==========================================
@app.get("/api/rulebook/info")
def get_rulebook_information():
    """Returns metadata about the active rulebook file"""
    return get_rulebook_meta()

@app.get("/api/rulebook")
@app.get("/api/rulebook/download")
def download_rulebook_file():
    """Streams the official rulebook PDF file to the browser"""
    meta = get_rulebook_meta()
    if meta.get("exists") and meta.get("saved_filename"):
        file_path = os.path.join(UPLOADS_DIR, meta["saved_filename"])
        if os.path.exists(file_path):
            filename = meta.get("filename", "CODEMEET_2026_Official_Rulebook.pdf")
            media_type = "application/pdf" if filename.lower().endswith(".pdf") else "application/octet-stream"
            return FileResponse(
                path=file_path,
                filename=filename,
                media_type=media_type
            )

    # Fallback to default starter rulebook
    default_path = os.path.join(UPLOADS_DIR, "CODEMEET_2026_Official_Rulebook.pdf")
    if not os.path.exists(default_path):
        with open(default_path, "wb") as f:
            f.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF")

    return FileResponse(
        path=default_path,
        filename="CODEMEET_2026_Official_Rulebook.pdf",
        media_type="application/pdf"
    )

@app.post("/api/admin/rulebook/upload")
async def admin_upload_rulebook(
    file: UploadFile = File(...),
    authorized: bool = Depends(verify_admin_auth)
):
    """Admin endpoint to upload a new rulebook (PDF/DOC/DOCX) - Protected by 2FA"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    allowed_exts = [".pdf", ".docx", ".doc", ".zip"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOC, DOCX files are allowed.")

    content = await file.read()
    if len(content) > 30 * 1024 * 1024:  # 30 MB max
        raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 30 MB.")

    saved_filename = f"rulebook_{int(time.time())}{ext}"
    target_path = os.path.join(UPLOADS_DIR, saved_filename)

    # Clean up any previous uploads
    for f in os.listdir(UPLOADS_DIR):
        if f.startswith("rulebook_"):
            try:
                os.remove(os.path.join(UPLOADS_DIR, f))
            except Exception:
                pass

    with open(target_path, "wb") as f:
        f.write(content)

    meta = {
        "exists": True,
        "filename": file.filename,
        "saved_filename": saved_filename,
        "size_bytes": len(content),
        "size_formatted": f"{len(content) / (1024 * 1024):.2f} MB" if len(content) >= 1024*1024 else f"{len(content) / 1024:.1f} KB",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "is_default": False
    }

    with open(RULEBOOK_META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    return {
        "success": True,
        "message": f"Rulebook '{file.filename}' uploaded and published successfully!",
        "meta": meta
    }

@app.delete("/api/admin/rulebook")
def admin_delete_rulebook(
    authorized: bool = Depends(verify_admin_auth)
):
    """Admin endpoint to delete current custom rulebook - Protected by 2FA"""
    if os.path.exists(RULEBOOK_META_FILE):
        try:
            with open(RULEBOOK_META_FILE, "r", encoding="utf-8") as f:
                meta = json.load(f)
                file_path = os.path.join(UPLOADS_DIR, meta.get("saved_filename", ""))
                if os.path.exists(file_path):
                    os.remove(file_path)
            os.remove(RULEBOOK_META_FILE)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting rulebook file: {str(e)}")

    return {
        "success": True,
        "message": "Custom rulebook deleted. Reverted to default rulebook.",
        "meta": get_rulebook_meta()
    }

@app.get("/api/config/payment")
def get_payment_config():
    return {
        "key_id": RAZORPAY_KEY_ID,
        "pricing": get_event_pricings(),
        "currency": "INR",
        "mode": "test"
    }

# ==========================================
# STEP 1: BACKEND - CREATE ORDER (DYNAMIC PRICING)
# ==========================================
@app.post("/api/create-order")
@app.post("/api/payment/create-order")
def create_order(data: CreateOrderRequest):
    event_id = data.event_id or "hackathon"
    pricing = get_event_pricing(event_id)

    # Resolve amount in paise dynamically from admin-configured pricing if not explicitly specified
    if data.amount and data.amount >= 100:
        amount_paise = data.amount
    elif pricing:
        amount_paise = pricing["amount_paise"]
    else:
        amount_paise = 10000  # Default ₹100.00

    # Minimum amount validation: 100 paise (₹1.00)
    if amount_paise < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be at least 100 paise (₹1.00)"
        )

    receipt_id = data.receipt or f"rcpt_{uuid.uuid4().hex[:10]}"

    order_payload = {
        "amount": amount_paise,
        "currency": data.currency or "INR",
        "receipt": receipt_id,
        "payment_capture": 1,
        "notes": {
            "event_id": event_id,
            "college": data.college_name or "",
            "amount_inr": amount_paise / 100
        }
    }

    try:
        order = razorpay_client.order.create(data=order_payload)
        return {
            "success": True,
            "order_id": order["id"],
            "amount": order["amount"],
            "amount_inr": order["amount"] / 100,
            "currency": order["currency"],
            "key_id": RAZORPAY_KEY_ID,
            "receipt": order.get("receipt", receipt_id)
        }
    except razorpay.errors.BadRequestError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except razorpay.errors.ServerError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Razorpay Server Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Order creation error: {str(e)}")

# ==========================================
# STEP 3: BACKEND - VERIFY SIGNATURE
# ==========================================
@app.post("/api/verify-payment")
def verify_payment(data: VerifyPaymentRequest):
    if not data.razorpay_order_id or not data.razorpay_payment_id or not data.razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required payment parameters: order_id, payment_id, and signature are required."
        )

    # Compute HMAC SHA256 signature
    msg = f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode("utf-8")
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg,
        hashlib.sha256
    ).hexdigest()

    # Compare generated signature with razorpay_signature
    if not secrets.compare_digest(generated_signature, data.razorpay_signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment signature verification failed. Invalid signature."
        )

    # Signature is authentic!
    registration_record = None
    reg_id = None

    # If registration details were attached with the verification request, persist to DB
    if data.college_name and data.members and len(data.members) > 0:
        event_id = data.event_id or "hackathon"
        event_name = data.event_name or "24H National Hackathon"
        prefix = "CM26"
        event_code = {
            "hackathon": "HACK",
            "speed-typing": "TYPE",
            "treasure-hunt": "HUNT",
            "free-fire": "FIRE"
        }.get(event_id, "PASS")
        
        short_uuid = uuid.uuid4().hex[:6].upper()
        reg_id = f"{prefix}-{event_code}-{short_uuid}"

        leader = data.members[0]
        members_data = [m.model_dump() for m in data.members]
        pricing = get_event_pricing(event_id)
        effective_amount = data.amount_paid if (data.amount_paid and data.amount_paid != "1") else (str(int(pricing["amount_inr"])) if pricing else (data.amount_paid or "100"))

        registration_record = save_registration(
            reg_id=reg_id,
            event_id=event_id,
            event_name=event_name,
            team_name=data.team_name or ("Solo" if data.is_solo else ""),
            college_name=data.college_name,
            leader_name=leader.name,
            leader_email=leader.email,
            leader_phone=leader.phone,
            members=members_data,
            is_solo=bool(data.is_solo),
            payment_status="PAID",
            payment_id=data.razorpay_payment_id,
            amount_paid=effective_amount
        )

    return {
        "success": True,
        "message": "Payment verified and authenticated successfully!",
        "order_id": data.razorpay_order_id,
        "payment_id": data.razorpay_payment_id,
        "registration_id": reg_id,
        "data": registration_record
    }

@app.post("/api/register")
def register_participant(data: RegistrationRequest):
    if not data.college_name.strip():
        raise HTTPException(status_code=400, detail="College / University name is required")
    
    if not data.members or len(data.members) == 0:
        raise HTTPException(status_code=400, detail="At least one participant is required")

    prefix = "CM26"
    event_code = {
        "hackathon": "HACK",
        "speed-typing": "TYPE",
        "treasure-hunt": "HUNT",
        "free-fire": "FIRE"
    }.get(data.event_id, "PASS")
    
    short_uuid = uuid.uuid4().hex[:6].upper()
    reg_id = f"{prefix}-{event_code}-{short_uuid}"

    leader = data.members[0]
    members_data = [m.model_dump() for m in data.members]

    reg = save_registration(
        reg_id=reg_id,
        event_id=data.event_id,
        event_name=data.event_name,
        team_name=data.team_name or ("Solo" if data.is_solo else ""),
        college_name=data.college_name,
        leader_name=leader.name,
        leader_email=leader.email,
        leader_phone=leader.phone,
        members=members_data,
        is_solo=bool(data.is_solo),
        payment_status="PAID" if data.payment_id else "VERIFIED",
        payment_id=data.payment_id or "",
        amount_paid=data.amount_paid or "1"
    )

    return {
        "success": True,
        "registration_id": reg_id,
        "payment_id": data.payment_id or "",
        "message": "Registration & payment confirmed successfully!",
        "data": reg
    }

# --- 2FA ADMIN AUTHENTICATION ENDPOINTS ---

@app.post("/api/admin/request-otp")
def admin_request_otp(data: RequestOTPRequest):
    if data.password.strip() != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin security key. Access denied.")

    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = time.time() + 300  # 5 minutes validity

    otp_store["otp"] = otp_code
    otp_store["expires_at"] = expires_at

    target_email = os.getenv("ADMIN_EMAIL", os.getenv("SMTP_EMAIL", "admin@codemeet.com")).strip()

    success, msg = send_admin_otp_email(target_email, otp_code)

    return {
        "success": True,
        "message": "Security verification code dispatched",
        "masked_email": mask_email(target_email),
        "expires_in_seconds": 300,
        "email_status": msg
    }

@app.post("/api/admin/verify-otp")
def admin_verify_otp(data: VerifyOTPRequest):
    if data.password.strip() != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin security key")

    stored_otp = otp_store.get("otp")
    expires_at = otp_store.get("expires_at", 0)

    if not stored_otp or time.time() > expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")

    if data.otp.strip() != stored_otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP verification code. Please try again.")

    otp_store.clear()

    session_token = f"cm26_sec_{secrets.token_urlsafe(32)}"
    active_sessions[session_token] = time.time() + (12 * 3600)

    return {
        "success": True,
        "message": "2FA Authentication successful. Welcome to Admin Portal.",
        "token": session_token
    }

@app.get("/api/admin/stats")
def admin_stats(_: bool = Depends(verify_admin_auth)):
    stats = get_stats()
    return {
        "success": True,
        "stats": stats
    }

@app.get("/api/admin/registrations")
def admin_get_registrations(
    event_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    _: bool = Depends(verify_admin_auth)
):
    regs = get_registrations(event_id=event_id, search=search)
    return {
        "success": True,
        "count": len(regs),
        "registrations": regs
    }

@app.post("/api/admin/registrations")
def admin_add_registration(data: RegistrationRequest, _: bool = Depends(verify_admin_auth)):
    prefix = "CM26"
    event_code = {
        "hackathon": "HACK",
        "speed-typing": "TYPE",
        "treasure-hunt": "HUNT",
        "free-fire": "FIRE"
    }.get(data.event_id, "PASS")
    
    short_uuid = uuid.uuid4().hex[:6].upper()
    reg_id = f"{prefix}-{event_code}-{short_uuid}"

    leader = data.members[0] if data.members else MemberSchema(name="", email="", phone="")
    members_data = [m.model_dump() for m in data.members]

    reg = save_registration(
        reg_id=reg_id,
        event_id=data.event_id,
        event_name=data.event_name,
        team_name=data.team_name or ("Solo" if data.is_solo else ""),
        college_name=data.college_name,
        leader_name=leader.name,
        leader_email=leader.email,
        leader_phone=leader.phone,
        members=members_data,
        is_solo=bool(data.is_solo),
        payment_status="VERIFIED",
        payment_id=data.payment_id or "ADMIN_MANUAL",
        amount_paid=data.amount_paid or "1"
    )

    return {
        "success": True,
        "message": "Participant / Team added successfully by Admin",
        "registration": reg
    }

@app.delete("/api/admin/registrations/{reg_id}")
def admin_delete_registration(reg_id: str, _: bool = Depends(verify_admin_auth)):
    deleted = delete_registration(reg_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Registration not found")
    return {
        "success": True,
        "message": f"Registration {reg_id} deleted successfully"
    }

@app.get("/api/admin/export/excel")
def admin_export_excel(
    event_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    _: bool = Depends(verify_admin_auth)
):
    regs = get_registrations(event_id=event_id, search=search)
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Registrations"
    
    headers = [
        "Registration ID",
        "Event ID",
        "Event Name",
        "Team Name",
        "College / Institution",
        "Total Members",
        "Leader Name",
        "Leader Email",
        "Leader Phone",
        "Member 2 Name",
        "Member 2 Email",
        "Member 2 Phone",
        "Member 3 Name",
        "Member 3 Email",
        "Member 3 Phone",
        "Member 4 Name",
        "Member 4 Email",
        "Member 4 Phone",
        "Amount Paid",
        "Razorpay Payment ID",
        "Payment Status",
        "Registration Timestamp"
    ]
    
    header_fill = PatternFill(start_color="CCFF00", end_color="CCFF00", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="000000")
    thin_border = Border(
        left=Side(style="thin", color="CCCCCC"),
        right=Side(style="thin", color="CCCCCC"),
        top=Side(style="thin", color="CCCCCC"),
        bottom=Side(style="thin", color="CCCCCC")
    )
    
    ws.append(headers)
    for col_num in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_num)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border
    
    ws.row_dimensions[1].height = 28
    
    for r_idx, reg in enumerate(regs, start=2):
        members = reg.get("members", [])
        m2 = members[1] if len(members) > 1 else {"name": "", "email": "", "phone": ""}
        m3 = members[2] if len(members) > 2 else {"name": "", "email": "", "phone": ""}
        m4 = members[3] if len(members) > 3 else {"name": "", "email": "", "phone": ""}
        
        row_data = [
            reg.get("id"),
            reg.get("event_id"),
            reg.get("event_name"),
            reg.get("team_name"),
            reg.get("college_name"),
            reg.get("total_members"),
            reg.get("leader_name"),
            reg.get("leader_email"),
            reg.get("leader_phone"),
            m2.get("name", ""),
            m2.get("email", ""),
            m2.get("phone", ""),
            m3.get("name", ""),
            m3.get("email", ""),
            m3.get("phone", ""),
            m4.get("name", ""),
            m4.get("email", ""),
            m4.get("phone", ""),
            f"₹{reg.get('amount_paid', '1')}",
            reg.get("payment_id", "N/A"),
            reg.get("payment_status", "PAID"),
            reg.get("created_at")
        ]
        ws.append(row_data)
        
        for c_idx in range(1, len(row_data) + 1):
            c = ws.cell(row=r_idx, column=c_idx)
            c.border = thin_border
            c.font = Font(name="Segoe UI", size=10)
            if c_idx in [1, 2, 6, 19, 20, 21]:
                c.alignment = Alignment(horizontal="center")
        
        ws.row_dimensions[r_idx].height = 22

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 14)
    
    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    
    filename = f"codemeet2026_registrations_{event_id or 'all'}.xlsx"
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
