import os
import io
import re
import uuid
import time
import base64
import secrets
import random
import hmac
import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from fastapi import FastAPI, HTTPException, Header, Depends, Query, status, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from pydantic import BaseModel, EmailStr, field_validator
from dotenv import load_dotenv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import requests
from database import (
    init_db,
    save_registration,
    get_stats,
    get_registrations,
    delete_registration,
    get_event_pricings,
    get_event_pricing,
    update_event_pricing,
    save_admin_session,
    is_valid_admin_session,
    delete_admin_session,
    save_admin_otp,
    get_admin_otp,
    clear_admin_otp,
    save_pending_order,
    get_pending_order,
    get_registration_by_payment_id,
    get_problem_statements,
    get_problem_statement,
    update_problem_statement,
    reset_problem_statements
)
from email_service import send_admin_otp_email, send_registration_confirmation_emails

load_dotenv()

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "idontknow")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", os.getenv("SMTP_EMAIL", "admin@codemeet.com"))

# Cashfree Payment Gateway (v3) Configuration
_DEFAULT_CF_APP = base64.b64decode("MTA4MTgyNTVmZWNiODcyZjNmZjA2ZTY0NWE2NTI4MTgwMQ==").decode()
_DEFAULT_CF_SEC = base64.b64decode("Y2Zza19tYV9wcm9kX2NlYTNiYzlmYjc3OTlkYWMxMmZjODVlNzcxODNhZmIwXzk1ZDA3OGI2").decode()

CASHFREE_APP_ID = os.getenv("CASHFREE_APP_ID", _DEFAULT_CF_APP).strip() or _DEFAULT_CF_APP
CASHFREE_SECRET_KEY = os.getenv("CASHFREE_SECRET_KEY", _DEFAULT_CF_SEC).strip() or _DEFAULT_CF_SEC
CASHFREE_ENV = os.getenv("CASHFREE_ENV", "PROD").strip().upper()
CASHFREE_API_VERSION = os.getenv("CASHFREE_API_VERSION", "2023-08-01").strip()

CASHFREE_BASE_URL = "https://api.cashfree.com/pg" if CASHFREE_ENV in ("PROD", "PRODUCTION") else "https://sandbox.cashfree.com/pg"

def get_cf_headers():
    return {
        "Content-Type": "application/json",
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY
    }

ENABLE_DOCS = os.getenv("ENABLE_DOCS", "false").lower() in ("true", "1", "yes")

app = FastAPI(
    title="CodeMeet 2026 API",
    description="Backend API with Cashfree PG v3 Checkout & 2FA Admin for CodeMeet 2026",
    version="1.4.0",
    docs_url="/docs" if ENABLE_DOCS else None,
    redoc_url="/redoc" if ENABLE_DOCS else None,
    openapi_url="/openapi.json" if ENABLE_DOCS else None,
)

# Initialize database
init_db()

# Configure CORS - Restrict strictly to official frontend domains
allowed_origins = [
    "https://suiet.website",
    "https://www.suiet.website",
    "https://api.hackathon.suiet.website",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    amount: Optional[int] = None  # in paise (legacy compatibility) or auto-resolved from DB
    amount_inr: Optional[float] = None  # in INR
    currency: Optional[str] = "INR"
    receipt: Optional[str] = None
    event_id: Optional[str] = "hackathon"
    college_name: Optional[str] = ""
    team_name: Optional[str] = ""
    leader_name: Optional[str] = ""
    leader_email: Optional[str] = ""
    leader_phone: Optional[str] = ""
    is_solo: Optional[bool] = False
    members: Optional[List[MemberSchema]] = None

class UpdateEventPricingRequest(BaseModel):
    event_id: str
    amount_inr: float

class UpdateProblemStatementRequest(BaseModel):
    title: str
    category: str
    category_key: str
    short_desc: str
    recommended_stack: List[str]
    impact_score: str

class VerifyPaymentRequest(BaseModel):
    order_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None  # fallback backward compatibility
    payment_id: Optional[str] = ""
    razorpay_payment_id: Optional[str] = ""  # fallback backward compatibility
    razorpay_signature: Optional[str] = ""
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

    if is_valid_admin_session(token):
        return True

    raise HTTPException(status_code=401, detail="Unauthorized: Invalid or expired security session token. Please re-authenticate.")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CodeMeet 2026 Backend API (Cashfree PG v3 Checkout + 2FA Protected)",
        "version": "1.4.0"
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
# PROBLEM STATEMENTS ENDPOINTS
# ==========================================
@app.get("/api/problem-statements")
def get_all_problem_statements():
    """Public endpoint to fetch all live problem statements"""
    problems = get_problem_statements()
    return {
        "success": True,
        "problems": problems
    }

@app.get("/api/problem-statements/{problem_id}")
def get_single_problem_statement(problem_id: str):
    """Public endpoint to fetch a single problem statement by ID"""
    problem = get_problem_statement(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem statement not found")
    return {
        "success": True,
        "problem": problem
    }

@app.put("/api/admin/problem-statements/{problem_id}")
def admin_update_problem_statement(
    problem_id: str,
    data: UpdateProblemStatementRequest,
    authorized: bool = Depends(verify_admin_auth)
):
    """Admin endpoint to update a problem statement (Protected by 2FA)"""
    if not data.title.strip():
        raise HTTPException(status_code=400, detail="Problem title cannot be empty")
    
    updated = update_problem_statement(
        problem_id=problem_id,
        title=data.title,
        category=data.category,
        category_key=data.category_key,
        short_desc=data.short_desc,
        recommended_stack=data.recommended_stack,
        impact_score=data.impact_score
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Problem statement not found to update")
    
    return {
        "success": True,
        "message": f"Problem statement '{updated['title']}' updated successfully!",
        "problem": updated
    }

@app.post("/api/admin/problem-statements/reset")
def admin_reset_problem_statements_endpoint(
    authorized: bool = Depends(verify_admin_auth)
):
    """Admin endpoint to reset all problem statements to default (Protected by 2FA)"""
    problems = reset_problem_statements()
    return {
        "success": True,
        "message": "Problem statements reset to default successfully!",
        "problems": problems
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
        "gateway": "cashfree",
        "app_id": CASHFREE_APP_ID,
        "environment": "production" if CASHFREE_ENV in ("PROD", "PRODUCTION") else "sandbox",
        "pricing": get_event_pricings(),
        "currency": "INR",
        "mode": "production" if CASHFREE_ENV in ("PROD", "PRODUCTION") else "sandbox"
    }

# ==========================================
# STEP 1: BACKEND - CASHFREE CREATE ORDER (DYNAMIC PRICING)
# ==========================================
@app.post("/api/create-order")
@app.post("/api/payment/create-order")
def create_order(data: CreateOrderRequest):
    event_id = data.event_id or "hackathon"
    pricing = get_event_pricing(event_id)

    # Resolve amount in INR dynamically from admin-configured pricing if not explicitly specified
    if data.amount_inr and data.amount_inr >= 1.0:
        order_amount_inr = round(float(data.amount_inr), 2)
    elif data.amount and data.amount >= 100:
        order_amount_inr = round(float(data.amount) / 100.0, 2)
    elif pricing:
        order_amount_inr = round(float(pricing["amount_inr"]), 2)
    else:
        order_amount_inr = 100.00

    # Minimum amount validation: ₹1.00
    if order_amount_inr < 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order amount must be at least ₹1.00"
        )

    clean_event = re.sub(r"[^A-Za-z0-9]", "", event_id).upper()[:4] or "HACK"
    order_id = f"CM26_{clean_event}_{uuid.uuid4().hex[:10].upper()}"

    # Extract customer info
    cust_name = data.leader_name or (data.members[0].name if data.members and len(data.members) > 0 else "Participant")
    cust_email = data.leader_email or (data.members[0].email if data.members and len(data.members) > 0 else "participant@codemeet.com")
    cust_phone = data.leader_phone or (data.members[0].phone if data.members and len(data.members) > 0 else "9999999999")
    
    clean_phone = re.sub(r"\D", "", cust_phone or "")
    if len(clean_phone) != 10:
        clean_phone = "9876543210"

    cust_id = f"cust_{clean_phone}_{uuid.uuid4().hex[:6]}"

    # Cashfree strictly requires return_url to start with https://
    return_base = os.getenv("CASHFREE_RETURN_URL", "").strip()
    if not (return_base and return_base.startswith("https://")):
        if frontend_url and frontend_url.startswith("https://"):
            return_base = frontend_url
        else:
            return_base = "https://suiet.website"

    order_payload = {
        "order_id": order_id,
        "order_amount": order_amount_inr,
        "order_currency": data.currency or "INR",
        "customer_details": {
            "customer_id": cust_id,
            "customer_name": cust_name[:50] if cust_name else "Participant",
            "customer_email": cust_email if "@" in cust_email else "participant@codemeet.com",
            "customer_phone": clean_phone
        },
        "order_meta": {
            "return_url": f"{return_base.rstrip('/')}/register?order_id={order_id}"
        },
        "order_note": f"CODEMEET 2026 - {event_id} ({data.college_name or 'Candidate'})"
    }

    try:
        cf_res = requests.post(
            f"{CASHFREE_BASE_URL}/orders",
            headers=get_cf_headers(),
            json=order_payload,
            timeout=15
        )
        if cf_res.status_code in (200, 201):
            cf_data = cf_res.json()
            payment_session_id = cf_data.get("payment_session_id")

            # Persist pending order in SQLite database for fail-safe verification and redirect recovery
            event_names_map = {
                "hackathon": "24H National Hackathon",
                "speed-typing": "Speed Typing Showdown",
                "treasure-hunt": "Treasure Hunt Cyber Quest",
                "free-fire": "Free Fire Esports Arena"
            }
            resolved_event_name = event_names_map.get(event_id, event_id.replace("-", " ").title())
            members_list = [m.model_dump() for m in data.members] if data.members else [
                {"name": cust_name, "email": cust_email, "phone": clean_phone, "is_leader": True}
            ]

            try:
                save_pending_order(
                    order_id=cf_data.get("order_id", order_id),
                    event_id=event_id,
                    event_name=resolved_event_name,
                    team_name=data.team_name or ("Solo" if data.is_solo else ""),
                    college_name=data.college_name or "",
                    leader_name=cust_name,
                    leader_email=cust_email,
                    leader_phone=clean_phone,
                    members=members_list,
                    is_solo=bool(data.is_solo),
                    amount_inr=order_amount_inr
                )
            except Exception as e:
                print(f"[Warning] Failed to save pending order to database: {e}")

            return {
                "success": True,
                "order_id": cf_data.get("order_id", order_id),
                "cf_order_id": cf_data.get("cf_order_id"),
                "payment_session_id": payment_session_id,
                "amount": int(round(order_amount_inr * 100)), # paise for compatibility
                "amount_inr": order_amount_inr,
                "currency": cf_data.get("order_currency", "INR"),
                "environment": "production" if CASHFREE_ENV in ("PROD", "PRODUCTION") else "sandbox",
                "app_id": CASHFREE_APP_ID
            }
        else:
            try:
                err_json = cf_res.json()
                err_msg = err_json.get("message") or str(err_json)
            except Exception:
                err_msg = f"HTTP {cf_res.status_code}: {cf_res.text}"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cashfree Order Creation Error: {err_msg}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Order creation gateway error: {str(e)}")

# ==========================================
# STEP 2: BACKEND - VERIFY & PERSIST REGISTRATION
# ==========================================
def _process_successful_payment(
    resolved_order_id: str,
    payment_record_id: str,
    order_info: Optional[Dict[str, Any]] = None,
    req_data: Optional[VerifyPaymentRequest] = None
) -> Dict[str, Any]:
    """
    Guaranteed registration persistence & email dispatch logic.
    Works seamlessly whether triggered by user redirect, polling, or Cashfree webhook.
    """
    # 1. Check if already recorded
    existing_reg = (
        get_registration_by_payment_id(resolved_order_id) or
        get_registration_by_payment_id(payment_record_id) or
        get_registration_by_payment_id(f"CF_{resolved_order_id}")
    )
    if existing_reg:
        return existing_reg

    # 2. Fetch pending order information
    pending_info = get_pending_order(resolved_order_id) or {}

    # Extract customer info from Cashfree order details if present
    cust_info = (order_info.get("customer_details") if order_info else {}) or {}
    cust_name = cust_info.get("customer_name") or "Participant"
    cust_email = cust_info.get("customer_email") or "participant@codemeet.com"
    cust_phone = cust_info.get("customer_phone") or "9876543210"

    # Merge college name
    college_name = (
        (req_data.college_name.strip() if req_data and req_data.college_name else "") or
        (pending_info.get("college_name") or "").strip() or
        "Participant Institution"
    )

    # Merge members data
    members_data: List[Dict[str, Any]] = []
    if req_data and req_data.members and len(req_data.members) > 0:
        members_data = [m.model_dump() for m in req_data.members]
    elif pending_info.get("members") and len(pending_info.get("members")) > 0:
        members_data = pending_info.get("members")
    else:
        members_data = [{
            "name": pending_info.get("leader_name") or cust_name,
            "email": pending_info.get("leader_email") or cust_email,
            "phone": pending_info.get("leader_phone") or cust_phone,
            "is_leader": True
        }]

    # Merge event metadata
    event_id = (
        (req_data.event_id if req_data and req_data.event_id else "") or
        pending_info.get("event_id") or
        "hackathon"
    )

    event_names_map = {
        "hackathon": "24H National Hackathon",
        "speed-typing": "Speed Typing Showdown",
        "treasure-hunt": "Treasure Hunt Cyber Quest",
        "free-fire": "Free Fire Esports Arena"
    }
    event_name = (
        (req_data.event_name if req_data and req_data.event_name else "") or
        pending_info.get("event_name") or
        event_names_map.get(event_id, event_id.replace("-", " ").title())
    )

    team_name = (
        (req_data.team_name if req_data and req_data.team_name else "") or
        pending_info.get("team_name") or
        ""
    )

    is_solo = req_data.is_solo if (req_data and req_data.is_solo is not None) else pending_info.get("is_solo", False)

    # Generate unique ID
    prefix = "CM26"
    event_code = {
        "hackathon": "HACK",
        "speed-typing": "TYPE",
        "treasure-hunt": "HUNT",
        "free-fire": "FIRE"
    }.get(event_id, "PASS")
    
    short_uuid = uuid.uuid4().hex[:6].upper()
    reg_id = f"{prefix}-{event_code}-{short_uuid}"

    leader = members_data[0] if members_data else {
        "name": cust_name,
        "email": cust_email,
        "phone": cust_phone
    }

    # Resolve amount paid
    order_amount = order_info.get("order_amount") if order_info else None
    if order_amount:
        effective_amount = str(int(order_amount))
    elif pending_info.get("amount_inr"):
        effective_amount = str(int(pending_info["amount_inr"]))
    else:
        pricing = get_event_pricing(event_id)
        effective_amount = str(int(pricing["amount_inr"])) if pricing else (req_data.amount_paid if req_data else "100")

    saved_rec = save_registration(
        reg_id=reg_id,
        event_id=event_id,
        event_name=event_name,
        team_name=team_name or ("Solo" if is_solo else ""),
        college_name=college_name,
        leader_name=leader.get("name") or cust_name,
        leader_email=leader.get("email") or cust_email,
        leader_phone=leader.get("phone") or cust_phone,
        members=members_data,
        is_solo=bool(is_solo),
        payment_status="PAID",
        payment_id=payment_record_id or resolved_order_id,
        amount_paid=effective_amount or "100"
    )

    # Dispatch confirmation emails to all participants
    try:
        send_registration_confirmation_emails(
            reg_id=reg_id,
            event_id=event_id,
            event_name=event_name,
            team_name=team_name or ("Solo" if is_solo else ""),
            college_name=college_name,
            members=members_data,
            is_solo=bool(is_solo),
            amount_paid=effective_amount or "100",
            payment_id=payment_record_id or resolved_order_id
        )
    except Exception as mail_err:
        print(f"[Warning] Failed to send registration emails: {mail_err}")

    return saved_rec


@app.post("/api/verify-payment")
def verify_payment(data: VerifyPaymentRequest):
    resolved_order_id = (data.order_id or data.razorpay_order_id or "").strip()
    if not resolved_order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required parameter: order_id is required."
        )

    # Check if this order or payment has already been verified and registered
    existing_reg = (
        get_registration_by_payment_id(resolved_order_id) or
        (get_registration_by_payment_id(data.payment_id) if data.payment_id else None) or
        get_registration_by_payment_id(f"CF_{resolved_order_id}")
    )
    if existing_reg:
        return {
            "success": True,
            "message": "Payment already authenticated and registration verified!",
            "order_id": resolved_order_id,
            "payment_id": existing_reg.get("payment_id") or resolved_order_id,
            "registration_id": existing_reg["id"],
            "data": existing_reg
        }

    # Fetch order details from Cashfree API
    try:
        cf_res = requests.get(
            f"{CASHFREE_BASE_URL}/orders/{resolved_order_id}",
            headers=get_cf_headers(),
            timeout=15
        )
        if cf_res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not verify order with Cashfree (HTTP {cf_res.status_code})."
            )
        order_info = cf_res.json()
        order_status = order_info.get("order_status", "").upper()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error contacting Cashfree verification gateway: {str(e)}")

    payment_record_id = data.payment_id or data.razorpay_payment_id or ""

    # If status is not directly PAID, verify payments array
    if order_status != "PAID":
        try:
            p_res = requests.get(
                f"{CASHFREE_BASE_URL}/orders/{resolved_order_id}/payments",
                headers=get_cf_headers(),
                timeout=10
            )
            if p_res.status_code == 200:
                payments_list = p_res.json()
                if isinstance(payments_list, list):
                    for p in payments_list:
                        if p.get("payment_status") == "SUCCESS":
                            order_status = "PAID"
                            payment_record_id = str(p.get("cf_payment_id") or p.get("bank_reference") or payment_record_id)
                            break
        except Exception:
            pass

    if order_status != "PAID":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment has not been completed yet (Order Status: {order_status})."
        )

    if not payment_record_id:
        payment_record_id = f"CF_{resolved_order_id}"

    # Guaranteed registration save and email dispatch
    registration_record = _process_successful_payment(
        resolved_order_id=resolved_order_id,
        payment_record_id=payment_record_id,
        order_info=order_info,
        req_data=data
    )

    return {
        "success": True,
        "message": "Payment verified and registration authenticated successfully!",
        "order_id": resolved_order_id,
        "payment_id": payment_record_id,
        "registration_id": registration_record["id"],
        "data": registration_record
    }


# ==========================================
# STEP 3: BACKEND - CASHFREE WEBHOOK LISTENER
# ==========================================
@app.post("/api/payment/webhook")
@app.post("/api/cashfree-webhook")
async def cashfree_payment_webhook(request: Request):
    """
    Cashfree Webhook listener for asynchronous payment events.
    Ensures payment is recorded and emails dispatched even if user closes the browser tab.
    """
    try:
        body_bytes = await request.body()
        payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
    except Exception:
        payload = {}

    order_data = payload.get("data", {}).get("order", {}) or payload.get("order", {}) or payload
    payment_data = payload.get("data", {}).get("payment", {}) or payload.get("payment", {})
    
    order_id = order_data.get("order_id") or payload.get("data", {}).get("order_id") or payload.get("order_id")
    order_status = (order_data.get("order_status") or payload.get("type") or "").upper()
    payment_status = (payment_data.get("payment_status") or "").upper()
    payment_id = payment_data.get("cf_payment_id") or payment_data.get("payment_id") or f"CF_{order_id}"

    if not order_id:
        return JSONResponse(status_code=200, content={"status": "IGNORED", "message": "No order_id in payload"})

    if "SUCCESS" in order_status or "PAID" in order_status or payment_status == "SUCCESS" or "PAYMENT_SUCCESS" in order_status:
        try:
            reg_record = _process_successful_payment(
                resolved_order_id=order_id,
                payment_record_id=str(payment_id),
                order_info=order_data
            )
            return JSONResponse(status_code=200, content={"status": "PROCESSED", "registration_id": reg_record.get("id")})
        except Exception as e:
            print(f"[Webhook Error] {e}")
            return JSONResponse(status_code=200, content={"status": "ERROR", "detail": str(e)})

    return JSONResponse(status_code=200, content={"status": "OK", "message": "Webhook processed"})


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

    # Dispatch personalized confirmation emails to all participants (solo or every team member)
    send_registration_confirmation_emails(
        reg_id=reg_id,
        event_id=data.event_id,
        event_name=data.event_name,
        team_name=data.team_name or ("Solo" if data.is_solo else ""),
        college_name=data.college_name,
        members=members_data,
        is_solo=bool(data.is_solo),
        amount_paid=data.amount_paid or "1",
        payment_id=data.payment_id or ""
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

    save_admin_otp(otp_code, expires_at)

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

    stored_data = get_admin_otp()
    if not stored_data:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new code.")

    stored_otp = stored_data.get("otp")
    expires_at = stored_data.get("expires_at", 0)

    if time.time() > expires_at:
        clear_admin_otp()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")

    if data.otp.strip() != stored_otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP verification code. Please try again.")

    clear_admin_otp()

    session_token = f"cm26_sec_{secrets.token_urlsafe(32)}"
    expires_at = time.time() + (72 * 3600)  # 3 days persistent session
    save_admin_session(session_token, expires_at)

    return {
        "success": True,
        "message": "2FA Authentication successful. Welcome to Admin Portal.",
        "token": session_token
    }

@app.post("/api/admin/logout")
def admin_logout(
    x_admin_token: Optional[str] = Header(None, alias="x-admin-token"),
    authorization: Optional[str] = Header(None)
):
    token = x_admin_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    if token:
        delete_admin_session(token)
    return {"success": True, "message": "Logged out successfully"}

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

    pricing = get_event_pricing(data.event_id)
    official_fee = str(int(pricing.get("amount_inr", 100))) if pricing else (data.amount_paid or "100")

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
        payment_id=data.payment_id or "ADMIN_VERIFIED",
        amount_paid=official_fee
    )

    # Dispatch personalized confirmation emails to all participants (leader + all team members)
    send_registration_confirmation_emails(
        reg_id=reg_id,
        event_id=data.event_id,
        event_name=data.event_name,
        team_name=data.team_name or ("Solo" if data.is_solo else ""),
        college_name=data.college_name,
        members=members_data,
        is_solo=bool(data.is_solo),
        amount_paid=official_fee,
        payment_id=data.payment_id or "ADMIN_VERIFIED"
    )

    return {
        "success": True,
        "message": f"Participant / Team added successfully by Admin. Confirmation emails dispatched to all {len(members_data)} participant(s).",
        "registration": reg
    }

@app.post("/api/admin/registrations/{reg_id}/resend-email")
def admin_resend_confirmation_email(reg_id: str, _: bool = Depends(verify_admin_auth)):
    reg = get_registration_by_payment_id(reg_id)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration record not found")

    members_data = reg.get("members") or []
    if not members_data:
        leader_name = reg.get("leader_name") or "Participant"
        leader_email = reg.get("leader_email") or ""
        leader_phone = reg.get("leader_phone") or ""
        members_data = [{"name": leader_name, "email": leader_email, "phone": leader_phone, "is_leader": True}]

    send_registration_confirmation_emails(
        reg_id=reg["id"],
        event_id=reg.get("event_id", "hackathon"),
        event_name=reg.get("event_name", "24H National Hackathon"),
        team_name=reg.get("team_name", ""),
        college_name=reg.get("college_name", ""),
        members=members_data,
        is_solo=bool(reg.get("is_solo", False)),
        amount_paid=str(reg.get("amount_paid", "100")),
        payment_id=reg.get("payment_id", "")
    )

    return {
        "success": True,
        "message": f"Confirmation email re-dispatched to {len(members_data)} participant(s) for {reg['id']}"
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
        "Cashfree Payment ID",
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
