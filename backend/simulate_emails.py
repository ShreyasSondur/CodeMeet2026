import os
import time
from dotenv import load_dotenv
from email_service import _send_single_confirmation_email

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "shreyas.u.sondur@gmail.com").strip()
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "").strip()
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

print(f"==================================================")
print(f"DISPATCHING SIMULATION EMAILS TO: {ADMIN_EMAIL}")
print(f"FROM: {SMTP_EMAIL}")
print(f"==================================================")

simulations = [
    {
        "event_id": "hackathon",
        "event_name": "24H National Hackathon",
        "reg_id": "CM26-HACK-SIM01",
        "team_name": "CyberDynasty",
        "college_name": "Srinivas University Institute of Engineering & Technology (SUIET)",
        "is_solo": False,
        "amount_paid": "299",
        "payment_id": "pay_SimHackathon_LivePreview",
        "members": [
            {"name": "Shreyas Sondur", "email": ADMIN_EMAIL, "phone": "9876543210", "is_leader": True},
            {"name": "Aarav Sharma", "email": "aarav.dev@example.com", "phone": "9876543211", "is_leader": False},
            {"name": "Ananya Rao", "email": "ananya.code@example.com", "phone": "9876543212", "is_leader": False},
            {"name": "Vikram Hegde", "email": "vikram.tech@example.com", "phone": "9876543213", "is_leader": False},
        ]
    },
    {
        "event_id": "speed-typing",
        "event_name": "Speed Typing Showdown",
        "reg_id": "CM26-TYPE-SIM02",
        "team_name": "",
        "college_name": "Srinivas University Institute of Engineering & Technology (SUIET)",
        "is_solo": True,
        "amount_paid": "99",
        "payment_id": "pay_SimSpeedType_LivePreview",
        "members": [
            {"name": "Shreyas Sondur", "email": ADMIN_EMAIL, "phone": "9876543210", "is_leader": True},
        ]
    },
    {
        "event_id": "treasure-hunt",
        "event_name": "Treasure Hunt Cyber Quest",
        "reg_id": "CM26-HUNT-SIM03",
        "team_name": "Quantum Cipher",
        "college_name": "Srinivas University Institute of Engineering & Technology (SUIET)",
        "is_solo": False,
        "amount_paid": "149",
        "payment_id": "pay_SimHunt_LivePreview",
        "members": [
            {"name": "Shreyas Sondur", "email": ADMIN_EMAIL, "phone": "9876543210", "is_leader": True},
            {"name": "Rohan Pai", "email": "rohan.hunt@example.com", "phone": "9876543214", "is_leader": False},
            {"name": "Divya Shetty", "email": "divya.crypto@example.com", "phone": "9876543215", "is_leader": False},
            {"name": "Karthik Bhat", "email": "karthik.quest@example.com", "phone": "9876543216", "is_leader": False},
        ]
    },
    {
        "event_id": "free-fire",
        "event_name": "Free Fire eSports Battle",
        "reg_id": "CM26-FIRE-SIM04",
        "team_name": "Apex Strikers",
        "college_name": "Srinivas University Institute of Engineering & Technology (SUIET)",
        "is_solo": False,
        "amount_paid": "199",
        "payment_id": "pay_SimFreeFire_LivePreview",
        "members": [
            {"name": "Shreyas Sondur", "email": ADMIN_EMAIL, "phone": "9876543210", "is_leader": True},
            {"name": "Rahul Nair", "email": "rahul.esports@example.com", "phone": "9876543217", "is_leader": False},
            {"name": "Sameer Khan", "email": "sameer.battle@example.com", "phone": "9876543218", "is_leader": False},
            {"name": "Varun Kamath", "email": "varun.fps@example.com", "phone": "9876543219", "is_leader": False},
        ]
    }
]

for idx, item in enumerate(simulations):
    print(f"\n[{idx+1}/4] Sending simulation for '{item['event_name']}' ({item['event_id']})...")
    success = _send_single_confirmation_email(
        to_email=ADMIN_EMAIL,
        participant_name="Shreyas Sondur",
        is_leader=True,
        reg_id=item["reg_id"],
        event_id=item["event_id"],
        event_name=item["event_name"],
        team_name=item["team_name"],
        college_name=item["college_name"],
        all_members=item["members"],
        is_solo=item["is_solo"],
        amount_paid=item["amount_paid"],
        payment_id=item["payment_id"],
        smtp_email=SMTP_EMAIL,
        smtp_password=SMTP_PASSWORD,
        smtp_host=SMTP_HOST,
        smtp_port=SMTP_PORT
    )
    if success:
        print(f"  --> Delivered '{item['event_name']}' email successfully to {ADMIN_EMAIL}!")
    else:
        print(f"  --> FAILED to deliver '{item['event_name']}'.")
    time.sleep(1)

print("\n==================================================")
print("ALL 4 EVENT SIMULATIONS COMPLETED SUCCESSFULLY!")
print("==================================================")
