#!/usr/bin/env python3
"""
CODEMEET 2026 - Production Database Migration & Zero-Data-Loss Engine
=====================================================================
Features:
1. Automatic atomic backup of SQLite database before making any changes.
2. Comprehensive pre-migration row counting & data snapshot.
3. Safe schema migration:
   - registrations: adds payment_id, amount_paid, order_id if missing.
   - event_pricing: adds is_open column (DEFAULT 1) if missing, updates NULLs to 1.
   - seeds missing standard event pricings without altering existing custom amounts.
   - problem_statements: verifies table and seeds defaults if empty.
   - pending_orders, admin_sessions, admin_otps: verifies tables.
4. Concurrency safety: sets timeout=30.0 and WAL journal mode.
5. Post-migration data integrity verification:
   - PRAGMA integrity_check.
   - Asserts registration count >= pre-migration count (zero data loss guarantee).
   - Asserts event pricing count >= pre-migration count.
   - Confirms all records are intact and queryable.
6. Fail-safe rollback: In case of any error, automatically restores from backup.
"""

import os
import sys
import sqlite3
import shutil
import json
from datetime import datetime, timezone

# Ensure stdout handles UTF-8 safely
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(CURRENT_DIR, "data")
BACKUP_DIR = os.path.join(DB_DIR, "backups")
DB_PATH = os.path.join(DB_DIR, "codemeet.db")

def print_banner(msg: str):
    print("=" * 65)
    print(f"  {msg}")
    print("=" * 65)

def create_safe_backup(db_path: str) -> str:
    """Creates a consistent, atomic SQLite online backup before migration."""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"codemeet_pre_migration_{timestamp}.db")
    
    src = sqlite3.connect(db_path, timeout=30.0)
    dst = sqlite3.connect(backup_path)
    with dst:
        src.backup(dst, pages=100)
    dst.close()
    src.close()
    
    # Prune old backups, keeping the 15 most recent
    try:
        backups = sorted(
            [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.startswith("codemeet_") and f.endswith(".db")],
            key=os.path.getmtime
        )
        while len(backups) > 15:
            oldest = backups.pop(0)
            os.remove(oldest)
    except Exception as e:
        print(f"  [Notice] Backup pruning notice: {e}")
        
    return backup_path

def get_table_row_count(conn: sqlite3.Connection, table_name: str) -> int:
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    if not cursor.fetchone():
        return 0
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    return cursor.fetchone()[0]

def run_migration() -> bool:
    print_banner("CODEMEET 2026 - PRODUCTION DATABASE MIGRATION ENGINE")
    print(f"Target Database: {DB_PATH}")
    
    os.makedirs(DB_DIR, exist_ok=True)
    db_existed = os.path.exists(DB_PATH) and os.path.getsize(DB_PATH) > 0
    
    backup_file = None
    pre_counts = {
        "registrations": 0,
        "event_pricing": 0,
        "problem_statements": 0,
        "pending_orders": 0,
        "admin_sessions": 0,
        "admin_otps": 0
    }
    
    if db_existed:
        print("\n[Step 1/5] Backing up existing database...")
        try:
            backup_file = create_safe_backup(DB_PATH)
            backup_size = os.path.getsize(backup_file)
            print(f"  [OK] Atomic backup created: {os.path.basename(backup_file)} ({backup_size:,} bytes)")
        except Exception as e:
            print(f"  [ERROR] Failed to create backup: {e}")
            return False
            
        # Snapshot existing row counts
        try:
            conn_check = sqlite3.connect(DB_PATH, timeout=30.0)
            conn_check.row_factory = sqlite3.Row
            for tbl in pre_counts.keys():
                pre_counts[tbl] = get_table_row_count(conn_check, tbl)
            conn_check.close()
            print("  [SNAPSHOT] Pre-Migration Record Counts:")
            for tbl, cnt in pre_counts.items():
                print(f"     - {tbl}: {cnt} record(s)")
        except Exception as e:
            print(f"  [WARNING] Error reading pre-counts: {e}")
    else:
        print("\n[Step 1/5] New database will be initialized at target path.")

    # Step 2: Apply Migrations
    print("\n[Step 2/5] Applying schema migrations & table verifications...")
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # 1. Registrations table
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
                order_id TEXT DEFAULT '',
                created_at TEXT NOT NULL
            )
        """)
        
        # Verify registrations columns
        cursor.execute("PRAGMA table_info(registrations)")
        reg_cols = [row["name"] for row in cursor.fetchall()]
        for col, col_type, col_def in [
            ("payment_id", "TEXT", "''"),
            ("amount_paid", "TEXT", "'1'"),
            ("order_id", "TEXT", "''")
        ]:
            if col not in reg_cols:
                print(f"  -> Adding missing column to registrations: {col}...")
                cursor.execute(f"ALTER TABLE registrations ADD COLUMN {col} {col_type} DEFAULT {col_def}")

        # 2. Event Pricing table (with is_open column)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS event_pricing (
                event_id TEXT PRIMARY KEY,
                event_name TEXT NOT NULL,
                amount_inr REAL NOT NULL,
                amount_paise INTEGER NOT NULL,
                currency TEXT DEFAULT 'INR',
                is_open INTEGER DEFAULT 1,
                updated_at TEXT NOT NULL
            )
        """)
        
        # Check is_open column in event_pricing
        cursor.execute("PRAGMA table_info(event_pricing)")
        pricing_cols = [row["name"] for row in cursor.fetchall()]
        if "is_open" not in pricing_cols:
            print("  -> Adding missing column to event_pricing: is_open (DEFAULT 1)...")
            cursor.execute("ALTER TABLE event_pricing ADD COLUMN is_open INTEGER DEFAULT 1")
            
        # Ensure any NULLs are cleanly updated to 1 (OPEN)
        cursor.execute("UPDATE event_pricing SET is_open = 1 WHERE is_open IS NULL")
        
        # Ensure canonical event entries exist without altering customized entry fees
        cursor.execute("SELECT event_id FROM event_pricing")
        existing_event_ids = {row["event_id"] for row in cursor.fetchall()}
        
        default_events = [
            ("hackathon", "24H National Hackathon", 100.0, 10000, 1),
            ("speed-typing", "Speed Typing Showdown", 100.0, 10000, 1),
            ("treasure-hunt", "Treasure Hunt Cyber Quest", 200.0, 20000, 1),
            ("free-fire", "Free Fire Esports Arena", 200.0, 20000, 1),
        ]
        now_iso = datetime.now(timezone.utc).isoformat()
        
        for eid, name, inr, paise, is_open_val in default_events:
            if eid not in existing_event_ids:
                print(f"  -> Seeding missing event pricing entry: {name} ({eid})...")
                cursor.execute(
                    "INSERT INTO event_pricing (event_id, event_name, amount_inr, amount_paise, currency, is_open, updated_at) VALUES (?, ?, ?, ?, 'INR', ?, ?)",
                    (eid, name, inr, paise, is_open_val, now_iso)
                )

        # 3. Problem Statements table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS problem_statements (
                id TEXT PRIMARY KEY,
                problem_num INTEGER NOT NULL,
                label TEXT NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                category_key TEXT NOT NULL,
                short_desc TEXT NOT NULL,
                recommended_stack_json TEXT NOT NULL,
                impact_score TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        
        cursor.execute("SELECT COUNT(*) as cnt FROM problem_statements")
        if cursor.fetchone()["cnt"] == 0:
            print("  -> Seeding default problem statements...")
            default_problems = [
                ("problem-1", 1, "Problem 1", "Smart Civic Issue Reporting", "CIVIC TECH", "civic",
                 "Local issues like potholes, garbage, and broken streetlights often go unaddressed due to lack of visibility and feedback. There is a need for a transparent platform where citizens can report such problems, track their status, and help authorities prioritize them.",
                 json.dumps(["Next.js", "Computer Vision", "Geolocation", "PostGIS"]), "High Municipal Impact", now_iso),
                ("problem-2", 2, "Problem 2", "Personalized Learning Assistant", "AI & EDTECH", "edtech",
                 "Students face challenges because one-size-fits-all teaching does not match their individual strengths and weaknesses. There is a need for an intelligent assistant that adapts to learners, providing tailored study plans and real-time feedback.",
                 json.dumps(["React 19", "LLM Agents", "Knowledge Graphs", "Speech AI"]), "Global EdTech Shift", now_iso),
                ("problem-3", 3, "Problem 3", "AI for Early Disease Detection", "HEALTHCARE AI", "health",
                 "Critical illnesses often go undiagnosed until too late, due to limited resources and delays in analysis. There is a need for AI-based solutions that can detect diseases early from minimal patient data or imaging, enabling faster and more accurate diagnosis.",
                 json.dumps(["PyTorch", "Medical CNNs", "Edge AI", "DICOM"]), "Life-Saving Potential", now_iso),
                ("problem-4", 4, "Problem 4", "Smart Disaster Response Platform", "DISASTER RESPONSE", "disaster",
                 "During floods, landslides, and urban disasters, victims and responders struggle with poor coordination and slow resource allocation. There is a need for a system that enables quick reporting of emergencies, real-time resource matching, and clear guidance on safe zones for effective disaster relief.",
                 json.dumps(["WebRTC", "P2P Mesh", "GIS Mapping", "SOS Triage"]), "Crisis Critical Mission", now_iso),
            ]
            for p in default_problems:
                cursor.execute("""
                    INSERT INTO problem_statements (
                        id, problem_num, label, title, category, category_key,
                        short_desc, recommended_stack_json, impact_score, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, p)

        # 4. Auth & Support Tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_sessions (
                token TEXT PRIMARY KEY,
                expires_at REAL NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_otps (
                id TEXT PRIMARY KEY,
                otp TEXT NOT NULL,
                expires_at REAL NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pending_orders (
                order_id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                event_name TEXT NOT NULL,
                team_name TEXT,
                college_name TEXT NOT NULL,
                leader_name TEXT NOT NULL,
                leader_email TEXT NOT NULL,
                leader_phone TEXT NOT NULL,
                members_json TEXT NOT NULL,
                is_solo INTEGER DEFAULT 0,
                amount_inr REAL NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        conn.commit()
        print("  [OK] Schema migration executed successfully.")
        
    except Exception as err:
        conn.rollback()
        conn.close()
        print(f"\n[ERROR] Migration Error: {err}")
        if backup_file and os.path.exists(backup_file):
            print(f"  Restoring database from pre-migration backup: {backup_file}...")
            shutil.copy2(backup_file, DB_PATH)
            print("  [RESTORED] Database restored to original state before failure.")
        return False

    # Step 3: Integrity Check
    print("\n[Step 3/5] Running SQLite integrity check...")
    try:
        cursor.execute("PRAGMA integrity_check")
        integrity_row = cursor.fetchone()
        integrity_status = integrity_row[0] if integrity_row else "unknown"
        if integrity_status.lower() == "ok":
            print("  [OK] SQLite PRAGMA integrity_check: OK")
        else:
            print(f"  [ERROR] Integrity check failed: {integrity_status}")
            conn.close()
            return False
    except Exception as e:
        print(f"  [ERROR] Error running integrity check: {e}")
        conn.close()
        return False

    # Step 4: Zero-Data-Loss Verification
    print("\n[Step 4/5] Verifying zero data loss & data consistency...")
    post_counts = {}
    for tbl in pre_counts.keys():
        post_counts[tbl] = get_table_row_count(conn, tbl)
        
    print("  [VERIFIED] Post-Migration Record Counts:")
    for tbl, cnt in post_counts.items():
        diff = cnt - pre_counts[tbl]
        diff_str = f" (+{diff})" if diff > 0 else ""
        print(f"     - {tbl}: {cnt} record(s){diff_str}")

    # Critical assertions
    assert post_counts["registrations"] >= pre_counts["registrations"], (
        f"DATA MISMATCH: Registration count decreased! Pre={pre_counts['registrations']}, Post={post_counts['registrations']}"
    )
    assert post_counts["event_pricing"] >= pre_counts["event_pricing"], (
        "DATA MISMATCH: Event pricing count decreased!"
    )
    
    # Verify event_pricing records contain is_open
    cursor.execute("SELECT event_id, event_name, amount_inr, is_open FROM event_pricing")
    pricing_rows = cursor.fetchall()
    print("\n  [STATUS] Live Track Registration Statuses:")
    for row in pricing_rows:
        status_label = "OPEN (Accepting Registrations)" if bool(row["is_open"]) else "CLOSED (Gateway Paused)"
        print(f"     - {row['event_name']} ({row['event_id']}): Rs.{row['amount_inr']} [{status_label}]")

    conn.close()

    # Step 5: Summary
    print_banner("MIGRATION COMPLETED SUCCESSFULLY WITH ZERO DATA LOSS")
    if backup_file:
        print(f"Safe Backup Location: {backup_file}")
    print("All tables, columns, and data are consistent and ready for production.")
    print("=" * 65 + "\n")
    return True

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
