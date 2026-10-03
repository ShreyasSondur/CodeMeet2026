import sqlite3
import json
import os
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "codemeet.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS registrations (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL,
            event_name TEXT NOT NULL,
            team_name TEXT,
            college_name TEXT NOT NULL,
            leader_name TEXT NOT NULL,
            leader_email TEXT NOT NULL,
            leader_phone TEXT NOT NULL,
            members_json TEXT NOT NULL,
            is_solo INTEGER DEFAULT 0,
            total_members INTEGER DEFAULT 1,
            payment_status TEXT DEFAULT 'VERIFIED',
            payment_id TEXT DEFAULT '',
            amount_paid TEXT DEFAULT '1',
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS event_pricing (
            event_id TEXT PRIMARY KEY,
            event_name TEXT NOT NULL,
            amount_inr REAL NOT NULL,
            amount_paise INTEGER NOT NULL,
            currency TEXT DEFAULT 'INR',
            updated_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_sessions (
            token TEXT PRIMARY KEY,
            expires_at REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Seed default pricing if table is empty
    cursor.execute("SELECT COUNT(*) as cnt FROM event_pricing")
    count = cursor.fetchone()["cnt"]
    if count == 0:
        default_pricings = [
            ("hackathon", "24H National Hackathon", 100.0, 10000),
            ("speed-typing", "Speed Typing Showdown", 100.0, 10000),
            ("treasure-hunt", "Treasure Hunt Cyber Quest", 200.0, 20000),
            ("free-fire", "Free Fire Esports Arena", 200.0, 20000),
        ]
        now = datetime.utcnow().isoformat() + "Z"
        for eid, name, inr, paise in default_pricings:
            cursor.execute(
                "INSERT INTO event_pricing (event_id, event_name, amount_inr, amount_paise, currency, updated_at) VALUES (?, ?, ?, ?, 'INR', ?)",
                (eid, name, inr, paise, now)
            )

    # Add columns if they didn't exist in older table
    cursor.execute("PRAGMA table_info(registrations)")
    columns = [row["name"] for row in cursor.fetchall()]
    if "payment_id" not in columns:
        cursor.execute("ALTER TABLE registrations ADD COLUMN payment_id TEXT DEFAULT ''")
    if "amount_paid" not in columns:
        cursor.execute("ALTER TABLE registrations ADD COLUMN amount_paid TEXT DEFAULT '1'")
    conn.commit()
    conn.close()

def get_event_pricings() -> Dict[str, Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM event_pricing")
    rows = cursor.fetchall()
    conn.close()

    result = {}
    for row in rows:
        result[row["event_id"]] = {
            "event_id": row["event_id"],
            "event_name": row["event_name"],
            "amount_inr": float(row["amount_inr"]),
            "amount_paise": int(row["amount_paise"]),
            "currency": row["currency"],
            "updated_at": row["updated_at"]
        }
    return result

def get_event_pricing(event_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM event_pricing WHERE event_id = ?", (event_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "event_id": row["event_id"],
            "event_name": row["event_name"],
            "amount_inr": float(row["amount_inr"]),
            "amount_paise": int(row["amount_paise"]),
            "currency": row["currency"],
            "updated_at": row["updated_at"]
        }
    return None

def update_event_pricing(event_id: str, amount_inr: float) -> Dict[str, Any]:
    # Ensure minimum amount >= ₹1.00 (100 paise)
    if amount_inr < 1.0:
        amount_inr = 1.0
    
    amount_paise = int(round(amount_inr * 100))
    now = datetime.utcnow().isoformat() + "Z"

    event_names = {
        "hackathon": "24H National Hackathon",
        "speed-typing": "Speed Typing Showdown",
        "treasure-hunt": "Treasure Hunt Cyber Quest",
        "free-fire": "Free Fire Esports Arena",
    }
    name = event_names.get(event_id, event_id.replace("-", " ").title())

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO event_pricing (event_id, event_name, amount_inr, amount_paise, currency, updated_at)
        VALUES (?, ?, ?, ?, 'INR', ?)
        ON CONFLICT(event_id) DO UPDATE SET
            amount_inr = excluded.amount_inr,
            amount_paise = excluded.amount_paise,
            updated_at = excluded.updated_at
    """, (event_id, name, amount_inr, amount_paise, now))
    conn.commit()
    conn.close()

    return {
        "event_id": event_id,
        "event_name": name,
        "amount_inr": amount_inr,
        "amount_paise": amount_paise,
        "currency": "INR",
        "updated_at": now
    }

def save_registration(
    reg_id: str,
    event_id: str,
    event_name: str,
    team_name: Optional[str],
    college_name: str,
    leader_name: str,
    leader_email: str,
    leader_phone: str,
    members: List[Dict[str, Any]],
    is_solo: bool = False,
    payment_status: str = "VERIFIED",
    payment_id: str = "",
    amount_paid: str = "1",
    created_at: Optional[str] = None
) -> Dict[str, Any]:
    if not created_at:
        created_at = datetime.utcnow().isoformat() + "Z"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO registrations (
            id, event_id, event_name, team_name, college_name,
            leader_name, leader_email, leader_phone, members_json,
            is_solo, total_members, payment_status, payment_id, amount_paid, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        reg_id,
        event_id,
        event_name,
        team_name or "",
        college_name,
        leader_name,
        leader_email,
        leader_phone,
        json.dumps(members),
        1 if is_solo else 0,
        len(members),
        payment_status,
        payment_id or "",
        amount_paid or "1",
        created_at
    ))
    conn.commit()
    conn.close()

    return {
        "id": reg_id,
        "event_id": event_id,
        "event_name": event_name,
        "team_name": team_name or "",
        "college_name": college_name,
        "leader_name": leader_name,
        "leader_email": leader_email,
        "leader_phone": leader_phone,
        "members": members,
        "is_solo": is_solo,
        "total_members": len(members),
        "payment_status": payment_status,
        "payment_id": payment_id or "",
        "amount_paid": amount_paid or "1",
        "created_at": created_at
    }

def get_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT event_id, COUNT(*) as count FROM registrations GROUP BY event_id")
    rows = cursor.fetchall()
    
    event_counts = {
        "hackathon": 0,
        "speed-typing": 0,
        "treasure-hunt": 0,
        "free-fire": 0
    }
    total = 0
    for row in rows:
        eid = row["event_id"]
        cnt = row["count"]
        event_counts[eid] = cnt
        total += cnt
    
    conn.close()
    return {
        "total": total,
        "by_event": event_counts
    }

def get_registrations(event_id: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM registrations WHERE 1=1"
    params = []
    
    if event_id and event_id != "all":
        query += " AND event_id = ?"
        params.append(event_id)
    
    if search:
        search_pattern = f"%{search.strip()}%"
        query += " AND (team_name LIKE ? OR college_name LIKE ? OR leader_name LIKE ? OR leader_email LIKE ? OR leader_phone LIKE ? OR id LIKE ? OR payment_id LIKE ?)"
        params.extend([search_pattern] * 7)
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "event_id": row["event_id"],
            "event_name": row["event_name"],
            "team_name": row["team_name"],
            "college_name": row["college_name"],
            "leader_name": row["leader_name"],
            "leader_email": row["leader_email"],
            "leader_phone": row["leader_phone"],
            "members": json.loads(row["members_json"]),
            "is_solo": bool(row["is_solo"]),
            "total_members": row["total_members"],
            "payment_status": row["payment_status"],
            "payment_id": row["payment_id"] if "payment_id" in row.keys() else "",
            "amount_paid": row["amount_paid"] if "amount_paid" in row.keys() else "1",
            "created_at": row["created_at"]
        })
    
    conn.close()
    return results

def delete_registration(reg_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM registrations WHERE id = ?", (reg_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def save_admin_session(token: str, expires_at: float) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.utcnow().isoformat() + "Z"
    cursor.execute("""
        INSERT OR REPLACE INTO admin_sessions (token, expires_at, created_at)
        VALUES (?, ?, ?)
    """, (token, expires_at, now_str))
    conn.commit()
    conn.close()

def is_valid_admin_session(token: str) -> bool:
    if not token:
        return False
    now = time.time()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT expires_at FROM admin_sessions WHERE token = ?", (token,))
    row = cursor.fetchone()
    conn.close()
    if row:
        expires_at = float(row["expires_at"])
        if expires_at > now:
            return True
        else:
            delete_admin_session(token)
    return False

def delete_admin_session(token: str) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM admin_sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

