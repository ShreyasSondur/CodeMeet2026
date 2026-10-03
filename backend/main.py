import os
import io
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

from database import init_db, save_registration, get_stats, get_registrations, delete_registration

load_dotenv()

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "idontknow")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_TifQ6oZpnrGXwZ")

app = FastAPI(
    title="CodeMeet 2026 API",
    description="Backend API for CodeMeet 2026 Registrations and Admin Portal",
    version="1.0.0"
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

# Pydantic Schemas
class MemberSchema(BaseModel):
    name: str
    email: str
    phone: str
    is_leader: Optional[bool] = False

class RegistrationRequest(BaseModel):
    event_id: str
    event_name: str
    team_name: Optional[str] = ""
    college_name: str
    members: List[MemberSchema]
    is_solo: Optional[bool] = False
    payment_id: Optional[str] = ""
    amount_paid: Optional[str] = "1"

class AdminLoginRequest(BaseModel):
    password: str

def verify_admin_auth(x_admin_password: Optional[str] = Header(None, alias="x-admin-password")):
    if not x_admin_password or x_admin_password.strip() != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid admin password")
    return True

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CodeMeet 2026 Backend API",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "FastAPI backend is running and connected successfully!",
        "version": "1.0.0"
    }

RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

@app.get("/api/config/payment")
def get_payment_config():
    return {
        "key_id": RAZORPAY_KEY_ID,
        "amount_inr": 1,
        "amount_paise": 100,
        "currency": "INR",
        "mode": "test"
    }

@app.post("/api/payment/create-order")
def create_payment_order(data: dict):
    amount_inr = data.get("amount", 1)
    amount_paise = int(amount_inr * 100)
    
    if RAZORPAY_KEY_SECRET:
        try:
            import requests
            auth = (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
            order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"rcpt_{uuid.uuid4().hex[:8]}",
                "notes": {
                    "event_id": data.get("event_id", "hackathon"),
                    "college": data.get("college_name", "")
                }
            }
            res = requests.post("https://api.razorpay.com/v1/orders", auth=auth, json=order_data)
            if res.status_code == 200:
                order_json = res.json()
                return {
                    "success": True,
                    "order_id": order_json["id"],
                    "amount": order_json["amount"],
                    "currency": order_json["currency"],
                    "key_id": RAZORPAY_KEY_ID
                }
        except Exception as e:
            print("Razorpay order creation error:", e)

    return {
        "success": True,
        "order_id": None,
        "amount": amount_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID
    }

@app.post("/api/register")
def register_participant(data: RegistrationRequest):
    if not data.college_name.strip():
        raise HTTPException(status_code=400, detail="College / University name is required")
    
    if not data.members or len(data.members) == 0:
        raise HTTPException(status_code=400, detail="At least one participant is required")

    # Generate reference ID
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

# Admin Routes
@app.post("/api/admin/login")
def admin_login(data: AdminLoginRequest):
    if data.password.strip() == ADMIN_PASSWORD:
        return {
            "success": True,
            "message": "Authenticated successfully",
            "token": ADMIN_PASSWORD
        }
    raise HTTPException(status_code=401, detail="Invalid admin password. Access denied.")

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
    
    # Styling
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

    # Auto-adjust column widths
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
