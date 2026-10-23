"""
CODEMEET 2026 - Round 1 Hackathon Allocation Email Dispatcher
=============================================================
One-time automated script & module to dispatch Round 1 panel allocation
(Panels A, B, C, D, E) and WhatsApp group links to registered teams
from an Excel spreadsheet (.xlsx).

Features:
- Streamlined Cyberpunk dark HTML email template (clean & focused).
- Panels: PANEL A, PANEL B, PANEL C, PANEL D, PANEL E.
- Auto-detects Excel column headers (Team, Panel, WhatsApp Link, Email, etc.).
- Safe rate-limiting delay between email dispatches to prevent SMTP throttling.
- CLI support for:
    --test <email> : Send immediate test email to verify layout and delivery.
    --dry-run      : Parse Excel and print mapped data without sending.
    --excel <path> : Batch dispatch emails to all teams in the spreadsheet.
"""

import os
import sys
import time
import argparse
import email.utils
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, List, Optional, Tuple
from dotenv import load_dotenv

# Ensure current dir is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from email_service import get_smtp_config, _dispatch_smtp_message

load_dotenv()


def format_panel_name(raw_panel: str) -> str:
    """Format raw panel string to standard 'PANEL X' (A, B, C, D, E)."""
    p = (raw_panel or "").strip()
    if not p:
        return "PANEL A"
    upper = p.upper()
    if upper in ("A", "B", "C", "D", "E"):
        return f"PANEL {upper}"
    if not upper.startswith("PANEL"):
        return f"PANEL {upper}"
    return upper


def generate_round1_email_html(
    team_name: str,
    panel: str,
    whatsapp_link: str,
    leader_name: str = "",
    slot_info: str = "As scheduled in Panel WhatsApp Group",
) -> str:
    """Generate high-aesthetic, streamlined responsive HTML for Round 1 Panel Allocation."""

    formatted_panel = format_panel_name(panel)
    display_greeting = (
        f"Greetings <strong>{leader_name}</strong> &amp; Team <strong>{team_name}</strong>,"
        if leader_name
        else f"Greetings Team <strong>{team_name}</strong>,"
    )

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>CODEMEET 2026 - Round 1 Panel Allocation</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
    body {{ margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    @media only screen and (max-width: 600px) {{
      .email-container {{ width: 100% !important; padding: 12px !important; }}
      .header-title {{ font-size: 26px !important; }}
      .panel-badge {{ font-size: 22px !important; }}
      .card-padding {{ padding: 20px 16px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #050507; color: #ffffff;">
  <center>
    <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto;">
      
      <!-- Top Cyber Tag Badge -->
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="background-color: rgba(204, 255, 0, 0.08); border: 1px solid rgba(204, 255, 0, 0.4); border-radius: 24px; padding: 6px 16px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #ccff00; text-transform: uppercase;">
                  // ROUND 1 ALLOCATION PROTOCOL
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Container Card -->
      <tr>
        <td>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0a0f; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 12px 45px rgba(0, 0, 0, 0.85);">
            
            <!-- Glowing Neon Gradient Top Line -->
            <tr>
              <td height="4" style="background: linear-gradient(90deg, #ccff00 0%, #00f0ff 50%, #ccff00 100%);"></td>
            </tr>

            <!-- Header Title Block -->
            <tr>
              <td class="card-padding" style="padding: 32px 28px 18px 28px; text-align: center;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 3px; color: #a1a1aa; text-transform: uppercase; margin-bottom: 8px;">
                  SUIET &bull; WEBFLOW STUDENT COMMUNITY &bull; POWERED BY IBM
                </div>
                <h1 class="header-title" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 900; letter-spacing: 1.5px; color: #ffffff; text-transform: uppercase;">
                  CODE<span style="color: #ccff00;">MEET</span> 2026
                </h1>
                <div style="margin-top: 6px; font-size: 13px; font-weight: 600; color: #00f0ff; letter-spacing: 0.5px;">
                  24H National Hackathon &mdash; Round 1 Online Screening
                </div>
              </td>
            </tr>

            <!-- Greeting Text -->
            <tr>
              <td class="card-padding" style="padding: 0 28px 22px 28px;">
                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #e4e4e7;">
                  {display_greeting}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 13px; line-height: 21px; color: #a1a1aa;">
                  Congratulations on advancing to <strong>Round 1 (Online Screening)</strong> of CodeMeet 2026! Your team has been successfully allocated to your official evaluation panel.
                </p>
              </td>
            </tr>

            <!-- Panel Allocation Highlight Card -->
            <tr>
              <td class="card-padding" style="padding: 0 28px 24px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #111118; border: 1px solid rgba(204, 255, 0, 0.35); border-radius: 12px; padding: 22px; box-shadow: inset 0 0 20px rgba(204, 255, 0, 0.03);">
                  <tr>
                    <td>
                      <!-- Team Name Field -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); padding-bottom: 12px;">
                        <tr>
                          <td style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">
                            REGISTERED TEAM
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; padding-top: 4px;">
                            {team_name}
                          </td>
                        </tr>
                      </table>

                      <!-- Allocated Panel Badge -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); padding-bottom: 12px;">
                        <tr>
                          <td style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">
                            ALLOCATED EVALUATION PANEL
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 6px;">
                            <span class="panel-badge" style="display: inline-block; background-color: rgba(204, 255, 0, 0.15); border: 1.5px solid #ccff00; color: #ccff00; font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 900; letter-spacing: 2px; padding: 8px 20px; border-radius: 8px; box-shadow: 0 0 20px rgba(204, 255, 0, 0.2);">
                              {formatted_panel}
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- Timing / Slot Info -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">
                            ROUND 1 SCHEDULE &amp; TIMING
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #38bdf8; padding-top: 4px;">
                            {slot_info}
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- WhatsApp Group CTA Section -->
            <tr>
              <td class="card-padding" style="padding: 0 28px 26px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(18, 140, 126, 0.08) 100%); border: 1px solid rgba(37, 211, 102, 0.45); border-radius: 12px; padding: 24px; text-align: center;">
                  <tr>
                    <td>
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #25D366; text-transform: uppercase; margin-bottom: 6px;">
                        MANDATORY ACTION
                      </div>
                      <div style="font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
                        Join Your {formatted_panel} WhatsApp Group
                      </div>
                      <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 19px; color: #d4d4d8;">
                        Live Google Meet links, evaluator coordination, presentation queues, and real-time announcements will be shared exclusively inside this WhatsApp group.
                      </p>
                      
                      <!-- Green CTA Button -->
                      <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td align="center" style="background-color: #25D366; border-radius: 10px; box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);">
                            <a href="{whatsapp_link}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; color: #000000; text-decoration: none; text-transform: uppercase;">
                              &rarr; JOIN {formatted_panel} WHATSAPP GROUP
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="margin-top: 14px; font-size: 11px; color: #71717a; word-break: break-all;">
                        Direct Link: <a href="{whatsapp_link}" style="color: #25D366; text-decoration: underline;">{whatsapp_link}</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Clean Support Note -->
            <tr>
              <td class="card-padding" style="padding: 0 28px 24px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
                  <tr>
                    <td style="font-size: 12px; line-height: 18px; color: #a1a1aa;">
                      <strong style="color: #ffffff;">Need Assistance or Have Questions?</strong><br />
                      Please reach out to your designated Panel Coordinator inside the WhatsApp group, or reply directly to this email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer Signoff -->
            <tr>
              <td style="padding: 22px 28px; background-color: #07070b; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
                <div style="font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                  Best of Luck &bull; CodeMeet 2026 Organizing Committee
                </div>
                <div style="margin-top: 4px; font-size: 11px; color: #71717a;">
                  Srinivas University Institute of Engineering and Technology (SUIET), Mukka, Mangaluru
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- Sub-Footer -->
      <tr>
        <td align="center" style="padding-top: 20px;">
          <p style="margin: 0; font-size: 10px; line-height: 16px; color: #52525b; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            This email was sent to registered teams of CODEMEET 2026.<br />
            &copy; 2026 SUIET &bull; Webflow Student Community. All rights reserved.
          </p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
"""


def generate_round1_email_text(
    team_name: str,
    panel: str,
    whatsapp_link: str,
    leader_name: str = "",
    slot_info: str = "As scheduled in Panel WhatsApp Group",
) -> str:
    """Generate clean plain text fallback for Round 1 Panel Allocation."""
    formatted_panel = format_panel_name(panel)
    greeting = (
        f"Greetings {leader_name} & Team {team_name},"
        if leader_name
        else f"Greetings Team {team_name},"
    )

    text = f"""===================================================================
CODEMEET 2026 - 24H NATIONAL HACKATHON
ROUND 1 EVALUATION & PANEL ALLOCATION
===================================================================

{greeting}

Congratulations on advancing to Round 1 (Online Screening) of CodeMeet 2026!
Your team has been officially allocated to {formatted_panel}.

-------------------------------------------------------------------
YOUR ALLOCATION DETAILS:
-------------------------------------------------------------------
* Registered Team    : {team_name}
* Allocated Panel    : {formatted_panel}
* Schedule / Timing  : {slot_info}

-------------------------------------------------------------------
MANDATORY ACTION: JOIN YOUR PANEL WHATSAPP GROUP
-------------------------------------------------------------------
Live Google Meet links, evaluator coordination, presentation queues,
and real-time announcements will be shared exclusively inside this group.

Join {formatted_panel} WhatsApp Group:
{whatsapp_link}

-------------------------------------------------------------------
Need assistance or have queries?
Reach out to your panel coordinator inside the WhatsApp group,
or reply directly to this email.

Best regards,
CODEMEET 2026 Organizing Committee
Srinivas University Institute of Engineering and Technology (SUIET), Mukka, Mangaluru
In collaboration with Webflow Student Community | Powered by IBM
"""
    return text


def send_single_round1_allocation_email(
    to_email: str,
    team_name: str,
    panel: str,
    whatsapp_link: str,
    leader_name: str = "",
    slot_info: str = "As scheduled in Panel WhatsApp Group",
    custom_subject: Optional[str] = None,
) -> Tuple[bool, str]:
    """Send a single Round 1 Panel Allocation email via SMTP."""
    smtp_email, smtp_password, smtp_host, smtp_port = get_smtp_config()

    if not smtp_email or not smtp_password:
        return False, "SMTP credentials missing in .env (SMTP_EMAIL, SMTP_PASSWORD)"

    formatted_panel = format_panel_name(panel)
    subject = (
        custom_subject
        or f"[CODEMEET 2026] Round 1 Allocation: {formatted_panel} - Team {team_name}"
    )

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"CODEMEET 2026 Hackathon Desk <{smtp_email}>"
        msg["To"] = to_email
        msg["Reply-To"] = smtp_email
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg["Message-ID"] = email.utils.make_msgid(domain="srinivasuniversity.edu.in")
        msg["X-Priority"] = "1"
        msg["Importance"] = "High"

        plain_text = generate_round1_email_text(
            team_name=team_name,
            panel=formatted_panel,
            whatsapp_link=whatsapp_link,
            leader_name=leader_name,
            slot_info=slot_info,
        )
        html_content = generate_round1_email_html(
            team_name=team_name,
            panel=formatted_panel,
            whatsapp_link=whatsapp_link,
            leader_name=leader_name,
            slot_info=slot_info,
        )

        part1 = MIMEText(plain_text, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        msg.attach(part1)
        msg.attach(part2)

        return _dispatch_smtp_message(to_email, msg)
    except Exception as e:
        return False, f"Failed to build/dispatch email: {str(e)}"


def parse_allocations_from_excel(excel_path: str) -> List[Dict[str, Any]]:
    """
    Parse an Excel spreadsheet (.xlsx) with flexible header detection.
    Supports Panels A, B, C, D, E.
    """
    import openpyxl

    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Excel file not found at: {excel_path}")

    wb = openpyxl.load_workbook(excel_path, data_only=True)
    sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    # Find header row (first non-empty row)
    header_idx = 0
    headers = []
    for idx, r in enumerate(rows):
        if any(cell is not None for cell in r):
            header_idx = idx
            headers = [str(cell or "").strip().lower() for cell in r]
            break

    def find_col(candidates: List[str]) -> Optional[int]:
        for candidate in candidates:
            for idx, h in enumerate(headers):
                if candidate in h:
                    return idx
        return None

    team_col = find_col(["team name", "team_name", "team", "teamname"])
    panel_col = find_col(["panel", "allocated panel", "panel allocated", "panel no", "panel number"])
    wa_col = find_col(["whatsapp", "group link", "group_link", "wa link", "wa_link", "chat link", "joining link"])
    email_col = find_col(["email", "mail", "leader email", "leader_email"])
    leader_col = find_col(["leader name", "leader_name", "leader", "name", "candidate"])
    slot_col = find_col(["slot", "timing", "time slot", "time", "date"])

    print("\n--- Excel Column Detection ---")
    print(f"Team Name Column   : Index {team_col} ({headers[team_col] if team_col is not None else 'NOT FOUND'})")
    print(f"Panel Column       : Index {panel_col} ({headers[panel_col] if panel_col is not None else 'NOT FOUND'})")
    print(f"WhatsApp Column    : Index {wa_col} ({headers[wa_col] if wa_col is not None else 'NOT FOUND'})")
    print(f"Email Column       : Index {email_col} ({headers[email_col] if email_col is not None else 'NOT FOUND'})")
    print(f"Leader Name Column : Index {leader_col} ({headers[leader_col] if leader_col is not None else 'Optional'})")
    print(f"Slot Column        : Index {slot_col} ({headers[slot_col] if slot_col is not None else 'Optional'})")
    print("------------------------------\n")

    if team_col is None or panel_col is None or wa_col is None or email_col is None:
        raise ValueError(
            f"Could not map all required columns. Required: Team, Panel, WhatsApp Link, Email.\n"
            f"Detected headers: {headers}"
        )

    records = []
    for r in rows[header_idx + 1:]:
        if not any(r):
            continue

        team_val = str(r[team_col] or "").strip()
        panel_val = format_panel_name(str(r[panel_col] or "").strip())
        wa_val = str(r[wa_col] or "").strip()
        email_val = str(r[email_col] or "").strip()

        if not team_val or not email_val:
            continue

        leader_val = str(r[leader_col] or "").strip() if leader_col is not None and leader_col < len(r) else ""
        slot_val = str(r[slot_col] or "").strip() if slot_col is not None and slot_col < len(r) else "As scheduled in Panel WhatsApp Group"

        records.append({
            "team_name": team_val,
            "panel": panel_val,
            "whatsapp_link": wa_val,
            "email": email_val,
            "leader_name": leader_val,
            "slot_info": slot_val
        })

    return records


def dispatch_round1_allocations(
    excel_path: str,
    dry_run: bool = False,
    delay_seconds: float = 1.5,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    """Process Excel spreadsheet and send emails to all teams."""
    records = parse_allocations_from_excel(excel_path)
    total_records = len(records)
    print(f"Loaded {total_records} valid team allocation record(s) from {excel_path}.")

    if limit and limit > 0:
        records = records[:limit]
        print(f"Limited processing to first {len(records)} record(s).")

    if dry_run:
        print("\n[DRY RUN MODE ENABLED - NO EMAILS WILL BE SENT]")
        for idx, rec in enumerate(records, 1):
            print(f"{idx}. Team: {rec['team_name']} | Panel: {rec['panel']} | Email: {rec['email']} | WA: {rec['whatsapp_link']}")
        return {"total": len(records), "sent": 0, "failed": 0, "dry_run": True}

    sent_count = 0
    failed_count = 0
    failures = []

    print("\nStarting batch email dispatch...")
    for idx, rec in enumerate(records, 1):
        print(f"[{idx}/{len(records)}] Dispatching to Team '{rec['team_name']}' ({rec['email']}) -> {rec['panel']}...", end="", flush=True)

        ok, msg = send_single_round1_allocation_email(
            to_email=rec["email"],
            team_name=rec["team_name"],
            panel=rec["panel"],
            whatsapp_link=rec["whatsapp_link"],
            leader_name=rec.get("leader_name", ""),
            slot_info=rec.get("slot_info", "As scheduled in Panel WhatsApp Group")
        )

        if ok:
            print(" [OK]")
            sent_count += 1
        else:
            print(f" [FAILED: {msg}]")
            failed_count += 1
            failures.append({"team": rec["team_name"], "email": rec["email"], "error": msg})

        if idx < len(records) and delay_seconds > 0:
            time.sleep(delay_seconds)

    print("\n==========================================")
    print(f"BATCH COMPLETE: {sent_count} Sent, {failed_count} Failed out of {len(records)}")
    print("==========================================")

    return {
        "total": len(records),
        "sent": sent_count,
        "failed": failed_count,
        "failures": failures
    }


def main():
    parser = argparse.ArgumentParser(description="CodeMeet 2026 Round 1 Allocation Dispatcher")
    parser.add_argument("--test", type=str, help="Recipient email address for an instant live test email")
    parser.add_argument("--panel", type=str, default="A", help="Panel letter (A, B, C, D, E) for test email (default: A)")
    parser.add_argument("--excel", type=str, help="Path to Excel spreadsheet (.xlsx)")
    parser.add_argument("--dry-run", action="store_true", help="Parse and display records without dispatching")
    parser.add_argument("--delay", type=float, default=1.5, help="Delay in seconds between emails (default: 1.5s)")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of emails sent")

    args = parser.parse_args()

    if args.test:
        test_email = args.test.strip()
        panel_label = format_panel_name(args.panel)
        print(f"\n[TEST MODE] Dispatching updated allocation email to: {test_email} ({panel_label})")
        ok, msg = send_single_round1_allocation_email(
            to_email=test_email,
            team_name="CyberPulse Alpha",
            panel=panel_label,
            whatsapp_link="https://chat.whatsapp.com/GkmZhnNE3aIAvvdeyRqECq",
            leader_name="Shreyas Sondur",
            slot_info="As scheduled in Panel WhatsApp Group"
        )
        if ok:
            print(f"\n[SUCCESS] Updated test email successfully delivered to {test_email}!")
            print(f"Allocated Panel: {panel_label}")
            print("Check your inbox to view the updated streamlined template.")
        else:
            print(f"\n[ERROR] Delivery failed: {msg}")
        return

    if args.excel:
        dispatch_round1_allocations(
            excel_path=args.excel,
            dry_run=args.dry_run,
            delay_seconds=args.delay,
            limit=args.limit
        )
        return

    print("Please specify either --test <email> or --excel <path_to_excel> (or --help).")


if __name__ == "__main__":
    main()
