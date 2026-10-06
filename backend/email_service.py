import os
import smtplib
import ssl
import base64
import email.utils
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple

# Encoded defaults for Gmail SMTP Workspace
_DEFAULT_SMTP_EMAIL = base64.b64decode("d2ViZmxvd2NvbW11bml0eUBzcmluaXZhc3VuaXZlcnNpdHkuZWR1Lmlu").decode()
_DEFAULT_SMTP_PASS = base64.b64decode("Y2JxYXFpZ3JzZmlicHZreg==").decode()

def get_smtp_config() -> Tuple[str, str, str, int]:
    email_val = os.getenv("SMTP_EMAIL", "").strip()
    if not email_val or email_val == "your_smtp_email@example.com":
        email_val = _DEFAULT_SMTP_EMAIL

    pass_val = os.getenv("SMTP_PASSWORD", "").replace(" ", "").strip()
    if not pass_val or pass_val == "your_16_character_app_password":
        pass_val = _DEFAULT_SMTP_PASS

    host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip() or "smtp.gmail.com"
    try:
        port = int(os.getenv("SMTP_PORT", "587"))
    except Exception:
        port = 587
    return email_val, pass_val, host, port

def _dispatch_smtp_message(to_email: str, msg: MIMEMultipart) -> Tuple[bool, str]:
    smtp_email, smtp_password, smtp_host, smtp_port = get_smtp_config()

    # Try 1: Port 587 with STARTTLS (4 second timeout)
    try:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=4)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, [to_email], msg.as_string())
        server.quit()
        return True, "Delivered via TLS (587)"
    except Exception as err587:
        print(f"[SMTP Notice] Port 587 delivery failed ({err587}), attempting Port 465 SSL fallback...")
        
        # Try 2: Port 465 with SSL (4 second timeout)
        try:
            context = ssl.create_default_context()
            server_ssl = smtplib.SMTP_SSL(smtp_host, 465, context=context, timeout=4)
            server_ssl.login(smtp_email, smtp_password)
            server_ssl.sendmail(smtp_email, [to_email], msg.as_string())
            server_ssl.quit()
            return True, "Delivered via SSL (465)"
        except Exception as err465:
            return False, f"TLS 587 error: {err587} | SSL 465 error: {err465}"

def send_admin_otp_email(to_email: str, otp_code: str) -> Tuple[bool, str]:
    smtp_email, smtp_password, smtp_host, smtp_port = get_smtp_config()

    # Always log OTP to server console for backup / dev debugging
    print(f"\n========================================================")
    print(f"[CODEMEET 2026 2FA SECURITY] ADMIN OTP: {otp_code}")
    print(f"Destination Email: {to_email}")
    print(f"Sender Email: {smtp_email}")
    print(f"Validity: 5 Minutes")
    print(f"========================================================\n")

    if not smtp_email or not smtp_password:
        return True, "OTP generated (Console mode: Add SMTP_EMAIL and SMTP_PASSWORD to backend/.env to send real emails)"

    try:
        # Create multipart/alternative message (plain text + HTML) for maximum spam score compliance
        msg = MIMEMultipart("alternative")
        
        # Proper email headers to prevent spam detection
        msg["Subject"] = f"CODEMEET 2026 Admin Verification Code: {otp_code}"
        msg["From"] = f"CODEMEET 2026 Security <{smtp_email}>"
        msg["To"] = to_email
        msg["Reply-To"] = smtp_email
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg["Message-ID"] = email.utils.make_msgid(domain="srinivasuniversity.edu.in")
        msg["X-Priority"] = "1"
        msg["Importance"] = "High"

        # 1. Plain Text Alternative (Crucial for anti-spam filters & deliverability)
        text_content = f"""CODEMEET 2026 - Two-Factor Authentication Code

Your verification code is: {otp_code}

This one-time passcode expires in 5 minutes.
Use this code to complete your login on the /idk admin console.

If you did not request this code, please secure your credentials immediately.

---
Srinivas University Institute of Engineering & Technology (SUIET), Mukka, Mangaluru
Webflow Student Community - Official CODEMEET 2026 Security System
"""

        # 2. Modern, Responsive HTML Email Design
        html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>CODEMEET 2026 Security Code</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
    body {{ margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    @media only screen and (max-width: 600px) {{
      .email-container {{ width: 100% !important; padding: 16px !important; }}
      .otp-text {{ font-size: 32px !important; letter-spacing: 8px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #050507; color: #ffffff;">
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin: 0 auto;">
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="background-color: rgba(204, 255, 0, 0.1); border: 1px solid #ccff00; border-radius: 20px; padding: 4px 14px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #ccff00; text-transform: uppercase;">
                  // 2FA SECURITY PROTOCOL
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0e14; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);">
            <!-- Header Glow Banner -->
            <tr>
              <td style="background: linear-gradient(90deg, #ccff00 0%, #06b6d4 100%); height: 4px; line-height: 4px; font-size: 4px;">&nbsp;</td>
            </tr>

            <!-- Main Content Container -->
            <tr>
              <td style="padding: 36px 32px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 8px;">
                      <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                        Admin Verification Code
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <p style="margin: 0; font-size: 14px; line-height: 22px; color: #a1a1aa;">
                        A sign-in request was initiated for the <strong style="color: #ffffff;">CODEMEET 2026 Admin Console</strong> (<code style="font-family: monospace; color: #ccff00;">/idk</code>). Use the verification code below to authorize your session:
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Display Box -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; border: 2px dashed #ccff00; border-radius: 14px; text-align: center;">
                        <tr>
                          <td style="padding: 24px 16px;">
                            <div class="otp-text" style="font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #ccff00; margin-left: 12px;">
                              {otp_code}
                            </div>
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px;">
                              One-Time Passcode
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Expiration Note -->
                  <tr>
                    <td style="background-color: rgba(251, 191, 36, 0.08); border-left: 3px solid #fbbf24; border-radius: 6px; padding: 12px 14px; margin-bottom: 24px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #fbbf24;">
                        <strong>Note:</strong> This verification code is valid for <strong>5 minutes</strong>. If you did not initiate this login request, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                      <p style="margin: 0; font-size: 11px; line-height: 18px; color: #71717a; text-align: center;">
                        This is an automated authentication message from CODEMEET 2026.<br />
                        Do not forward or share this code with anyone.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer Organization Info -->
      <tr>
        <td align="center" style="padding-top: 24px;">
          <p style="margin: 0; font-size: 11px; line-height: 16px; color: #52525b; text-align: center;">
            <strong>Srinivas University Institute of Engineering and Technology (SUIET)</strong><br />
            Mukka, Mangaluru, Karnataka 574146 • In collaboration with Webflow Student Community
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
"""

        part1 = MIMEText(text_content, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        msg.attach(part1)
        msg.attach(part2)

        ok, status_msg = _dispatch_smtp_message(to_email, msg)
        if ok:
            print(f"[SUCCESS] OTP email delivered to {to_email} ({status_msg})")
            return True, "OTP email dispatched successfully"
        else:
            print(f"[ERROR] Failed to send OTP email to {to_email}: {status_msg}")
            return False, status_msg
    except Exception as e:
        err = f"Failed to send email: {str(e)}"
        print(f"[ERROR] {err}")
        return False, err
    except Exception as e:
        err = f"Failed to send email: {str(e)}"
        print(f"[ERROR] {err}")
        return False, err


EVENT_META_MAP = {
    "hackathon": {
        "title": "24H National Hackathon",
        "color": "#ccff00",
        "date": "OCT 23-24 (Round 1 Online Screening) • NOV 01-02 (Round 2 Grand 24H Offline Finale)",
        "venue": "Main Seminar Hall & Advanced Computing Labs, SUIET Mukka, Mangaluru",
        "tag": "FLAGSHIP 24H ARENA"
    },
    "speed-typing": {
        "title": "Speed Typing Showdown",
        "color": "#f59e0b",
        "date": "OCTOBER 31, 2026 • 10:30 AM IST",
        "venue": "Computing Lab 03 (Ground Floor), SUIET Mukka, Mangaluru",
        "tag": "SPEED & ACCURACY BLITZ"
    },
    "treasure-hunt": {
        "title": "Treasure Hunt Cyber Quest",
        "color": "#00f0ff",
        "date": "OCTOBER 31, 2026 • 02:30 PM IST",
        "venue": "Central Quadrangle & Campus Arena, SUIET Mukka, Mangaluru",
        "tag": "CAMPUS CIPHER QUEST"
    },
    "free-fire": {
        "title": "Free Fire eSports Battle",
        "color": "#ef4444",
        "date": "NOVEMBER 01, 2026 • 11:00 AM IST",
        "venue": "eSports Arena (Main Stage), SUIET Mukka, Mangaluru",
        "tag": "TACTICAL BATTLE ROYALE"
    }
}


def _send_single_confirmation_email(
    to_email: str,
    participant_name: str,
    is_leader: bool,
    reg_id: str,
    event_id: str,
    event_name: str,
    team_name: str,
    college_name: str,
    all_members: list,
    is_solo: bool,
    amount_paid: str,
    payment_id: str,
    smtp_email: str,
    smtp_password: str,
    smtp_host: str,
    smtp_port: int
) -> bool:
    """Send individual customized confirmation email to a single participant."""
    try:
        ev_info = EVENT_META_MAP.get(event_id, {
            "title": event_name or "CODEMEET 2026 Event",
            "color": "#ccff00",
            "date": "OCTOBER 31 - NOVEMBER 02, 2026",
            "venue": "SUIET Campus, Mukka, Mangaluru",
            "tag": "OFFICIAL EVENT"
        })

        color = ev_info["color"]
        event_title = ev_info["title"]
        event_date = ev_info["date"]
        event_venue = ev_info["venue"]
        event_tag = ev_info["tag"]
        role_label = "SOLO PARTICIPANT" if is_solo else ("TEAM LEADER" if is_leader else "TEAM MEMBER")
        display_team_name = "Solo Participant" if is_solo else (team_name or "Team")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Confirmed: CODEMEET 2026 Registration - {event_title} [{reg_id}]"
        msg["From"] = f"CODEMEET 2026 Registration Desk <{smtp_email}>"
        msg["To"] = to_email
        msg["Reply-To"] = smtp_email
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg["Message-ID"] = email.utils.make_msgid(domain="srinivasuniversity.edu.in")
        msg["X-Auto-Response-Suppress"] = "All"
        msg["Auto-Submitted"] = "auto-generated"
        msg["Precedence"] = "bulk"

        # Build roster lines for plain text & HTML
        roster_text_lines = []
        roster_html_rows = []
        for idx, m in enumerate(all_members):
            m_name = m.get("name", f"Member {idx + 1}")
            m_email = m.get("email", "")
            m_phone = m.get("phone", "")
            m_role = "Leader" if (m.get("is_leader") or idx == 0) else f"Member 0{idx + 1}"
            roster_text_lines.append(f"  {idx + 1}. {m_name} ({m_role}) - {m_email} | {m_phone}")

            is_current_user = (m_email.strip().lower() == to_email.strip().lower())
            bg_style = "background-color: rgba(204, 255, 0, 0.08);" if is_current_user else ""
            roster_html_rows.append(f"""
              <tr style="{bg_style}">
                <td style="padding: 10px 12px; font-size: 13px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <strong style="color: {'#ccff00' if is_current_user else '#ffffff'};">{m_name}</strong>
                  {' <span style="background-color: #ccff00; color: #000; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">YOU</span>' if is_current_user else ''}
                </td>
                <td style="padding: 10px 12px; font-size: 12px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace;">
                  {m_role}
                </td>
                <td style="padding: 10px 12px; font-size: 12px; color: #71717a; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: monospace;">
                  {m_phone}
                </td>
              </tr>
            """)

        roster_text_str = "\n".join(roster_text_lines)
        roster_html_str = "".join(roster_html_rows)

        # 1. Plain Text Alternative (Anti-Spam & Text Readers)
        text_content = f"""CODEMEET 2026 - OFFICIAL REGISTRATION CONFIRMATION

Hello {participant_name},

Congratulations! Your registration for CODEMEET 2026 has been successfully confirmed.

============================================================
PASS DETAILS & VERIFICATION
============================================================
Registration ID : {reg_id}
Event           : {event_title}
Role            : {role_label}
Team Name       : {display_team_name}
Institution     : {college_name}
Payment Status  : CONFIRMED (₹{amount_paid})
Ref / Order ID  : {payment_id or 'OFFICIAL_REGISTERED'}

============================================================
SCHEDULE & VENUE
============================================================
Date / Time     : {event_date}
Venue           : {event_venue}

============================================================
⚠️ MANDATORY ACTION: JOIN OFFICIAL WHATSAPP GROUP
============================================================
All team leaders and participants MUST join the official CODEMEET 2026 WhatsApp group to receive critical announcements, problem statement releases, venue seat allocations, and live scoreboards:

👉 Join Group Link: https://chat.whatsapp.com/GkmZhnNE3aIAvvdeyRqECq?s=cl&p=i&mlu=4&ilr=4

{f'''============================================================
TEAM ROSTER ({len(all_members)} Participants)
============================================================
{roster_text_str}
''' if not is_solo else ''}
============================================================
IMPORTANT INSTRUCTIONS FOR PARTICIPANTS
============================================================
1. Please bring your physical College / Institution Photo ID card.
2. Present this Registration ID ({reg_id}) or show this email at the registration desk upon arrival.
3. Arrive at the venue at least 30 minutes prior to scheduled start time.
4. Download the Official Rulebook from our portal for technical guidelines & evaluation rubrics.

Need assistance? Reply directly to this email or reach out to webflowcommunity@srinivasuniversity.edu.in.

---
Srinivas University Institute of Engineering and Technology (SUIET)
Mukka, Mangaluru, Karnataka 574146
Organized by Department of CSE & Webflow Student Community
"""

        # 2. Responsive & Anti-Spam Clean HTML
        html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Registration Confirmation - CODEMEET 2026</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
    body {{ margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ width: 100% !important; padding: 12px !important; }}
      .reg-badge {{ font-size: 20px !important; }}
      .detail-label {{ width: 100px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 24px 8px; background-color: #050507; color: #ffffff;">
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="max-width: 600px; margin: 0 auto;">
      
      <!-- Top Badge -->
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="background-color: rgba(204, 255, 0, 0.1); border: 1px solid #ccff00; border-radius: 20px; padding: 4px 16px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #ccff00; text-transform: uppercase;">
                  // OFFICIAL ENTRY PASS • {event_tag}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Card Container -->
      <tr>
        <td>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0e14; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 50px rgba(0, 0, 0, 0.9);">
            
            <!-- Glow Accent Top Border -->
            <tr>
              <td style="background: linear-gradient(90deg, {color} 0%, #00f0ff 100%); height: 4px; line-height: 4px; font-size: 4px;">&nbsp;</td>
            </tr>

            <!-- Header Content -->
            <tr>
              <td style="padding: 32px 28px 20px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: {color}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                        REGISTRATION CONFIRMED
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                        Congratulations, {participant_name}!
                      </h1>
                      <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 22px; color: #a1a1aa;">
                        You are officially registered for <strong style="color: #ffffff;">CODEMEET 2026 - {event_title}</strong>. We look forward to seeing you compete!
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Digital Pass Card Box -->
            <tr>
              <td style="padding: 0 28px 24px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; border: 2px dashed {color}; border-radius: 16px; overflow: hidden;">
                  <tr>
                    <td style="padding: 20px 20px 16px 20px; background-color: rgba(255,255,255,0.02); border-bottom: 1px dashed rgba(255,255,255,0.15);">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td>
                            <div style="font-size: 10px; font-family: monospace; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">
                              ENTRY PASS / REGISTRATION ID
                            </div>
                            <div class="reg-badge" style="font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 900; letter-spacing: 2px; color: {color}; margin-top: 4px;">
                              {reg_id}
                            </div>
                          </td>
                          <td align="right" valign="top">
                            <span style="background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ade80; font-size: 10px; font-weight: bold; font-family: monospace; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
                              PAID &amp; CONFIRMED
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Pass Details Grid -->
                  <tr>
                    <td style="padding: 16px 20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="detail-label" style="padding: 6px 0; font-size: 12px; color: #71717a; font-family: monospace; width: 130px;">
                            EVENT
                          </td>
                          <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #ffffff;">
                            {event_title}
                          </td>
                        </tr>
                        <tr>
                          <td class="detail-label" style="padding: 6px 0; font-size: 12px; color: #71717a; font-family: monospace;">
                            YOUR ROLE
                          </td>
                          <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: {color};">
                            {role_label}
                          </td>
                        </tr>
                        {f'''<tr>
                          <td class="detail-label" style="padding: 6px 0; font-size: 12px; color: #71717a; font-family: monospace;">
                            TEAM NAME
                          </td>
                          <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #ffffff;">
                            {display_team_name}
                          </td>
                        </tr>''' if not is_solo else ''}
                        <tr>
                          <td class="detail-label" style="padding: 6px 0; font-size: 12px; color: #71717a; font-family: monospace;">
                            INSTITUTION
                          </td>
                          <td style="padding: 6px 0; font-size: 13px; color: #e4e4e7;">
                            {college_name}
                          </td>
                        </tr>
                        <tr>
                          <td class="detail-label" style="padding: 6px 0; font-size: 12px; color: #71717a; font-family: monospace;">
                            TRANSACTION ID
                          </td>
                          <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #a1a1aa;">
                            {payment_id or 'OFFICIAL_VERIFIED'}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Event Schedule & Location Box -->
            <tr>
              <td style="padding: 0 28px 24px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
                  <tr>
                    <td style="padding-bottom: 10px;">
                      <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #ccff00; text-transform: uppercase; letter-spacing: 1px;">
                        📅 SCHEDULE &amp; VENUE
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; line-height: 20px; color: #ffffff; padding-bottom: 8px;">
                      <strong>Date &amp; Time:</strong> {event_date}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; line-height: 20px; color: #d4d4d8;">
                      <strong>Venue:</strong> {event_venue}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Team Roster Section (If Team Event) -->
            {f'''<tr>
              <td style="padding: 0 28px 24px 28px;">
                <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                  👥 REGISTERED TEAM ROSTER ({len(all_members)} Members)
                </div>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: rgba(255,255,255,0.04);">
                      <th align="left" style="padding: 8px 12px; font-size: 10px; font-family: monospace; color: #71717a; text-transform: uppercase;">Participant</th>
                      <th align="left" style="padding: 8px 12px; font-size: 10px; font-family: monospace; color: #71717a; text-transform: uppercase;">Role</th>
                      <th align="left" style="padding: 8px 12px; font-size: 10px; font-family: monospace; color: #71717a; text-transform: uppercase;">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster_html_str}
                  </tbody>
                </table>
              </td>
            </tr>''' if (not is_solo and len(all_members) > 1) else ''}

            <!-- WhatsApp Updates Mandatory Join Box -->
            <tr>
              <td style="padding: 0 28px 24px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b1411; border: 2px solid #25D366; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(37,211,102,0.15);">
                  <tr>
                    <td style="padding: 20px 22px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td>
                            <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #25D366; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                              // ACTION REQUIRED • MANDATORY GROUP
                            </div>
                            <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">
                              Join CODEMEET 2026 WhatsApp Community
                            </div>
                            <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 18px; color: #d4d4d8;">
                              <strong style="color: #fbbf24;">⚠️ Critical Notice:</strong> All participants MUST join the official WhatsApp community group. Problem statements, live reporting timings, seat allocations, and scoreboards are shared exclusively here.
                            </p>
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" style="background-color: #25D366; border-radius: 10px;">
                                  <a href="https://chat.whatsapp.com/GkmZhnNE3aIAvvdeyRqECq?s=cl&p=i&mlu=4&ilr=4" target="_blank" style="display: inline-block; background-color: #25D366; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 900; text-decoration: none; padding: 12px 24px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    👉 CLICK HERE TO JOIN WHATSAPP GROUP
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Important Guidelines Box -->
            <tr>
              <td style="padding: 0 28px 28px 28px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(204,255,0,0.03); border-left: 3px solid {color}; border-radius: 6px; padding: 14px 16px;">
                  <tr>
                    <td>
                      <div style="font-size: 12px; font-weight: bold; color: #ffffff; margin-bottom: 6px;">
                        Check-in &amp; Reporting Guidelines:
                      </div>
                      <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 20px; color: #a1a1aa;">
                        <li>Carry your physical College / Institution Photo ID card.</li>
                        <li>Show this email or quote your Registration ID (<code style="color: {color};">{reg_id}</code>) at the campus help desk.</li>
                        <li>Report at least 30 minutes prior to the start of the event.</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer Help Note -->
            <tr>
              <td style="padding: 18px 28px; background-color: rgba(0,0,0,0.4); border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #71717a;">
                  Questions or queries? Reply directly to this email or contact us at <a href="mailto:webflowcommunity@srinivasuniversity.edu.in" style="color: {color}; text-decoration: none;">webflowcommunity@srinivasuniversity.edu.in</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- Official Institute Footer -->
      <tr>
        <td align="center" style="padding-top: 24px;">
          <p style="margin: 0; font-size: 11px; line-height: 18px; color: #52525b; text-align: center;">
            <strong>Srinivas University Institute of Engineering and Technology (SUIET)</strong><br />
            Mukka, Mangaluru, Karnataka 574146 • In collaboration with Webflow Student Community<br />
            You received this email because you are registered as a participant for CODEMEET 2026.
          </p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
"""

        part1 = MIMEText(text_content, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        msg.attach(part1)
        msg.attach(part2)

        ok, status_msg = _dispatch_smtp_message(to_email, msg)
        if ok:
            print(f"[EMAIL SUCCESS] Dispatched confirmation email to participant: {participant_name} <{to_email}> for event {event_id} ({reg_id}) [{status_msg}]")
            return True
        else:
            print(f"[EMAIL ERROR] Failed to send confirmation email to {to_email}: {status_msg}")
            return False
    except Exception as e:
        print(f"[EMAIL ERROR] Exception sending confirmation email to {to_email}: {str(e)}")
        return False


def send_registration_confirmation_emails(
    reg_id: str,
    event_id: str,
    event_name: str,
    team_name: str,
    college_name: str,
    members: list,
    is_solo: bool,
    amount_paid: str = "100",
    payment_id: str = ""
):
    """
    Sends beautiful, customized confirmation emails to ALL participants in the team (or solo participant).
    Non-blocking / resilient: Errors for one recipient do not break other recipients.
    """
    import threading

    def _worker():
        smtp_email, smtp_password, smtp_host, smtp_port = get_smtp_config()

        print(f"[EMAIL SERVICE] Starting batch confirmation email dispatch for {reg_id} ({len(members)} recipient(s)) using {smtp_email}...")

        for idx, member in enumerate(members):
            to_email = (member.get("email") or "").strip()
            name = (member.get("name") or "Participant").strip()
            is_leader = bool(member.get("is_leader", False) or idx == 0)

            if not to_email or "@" not in to_email:
                continue

            _send_single_confirmation_email(
                to_email=to_email,
                participant_name=name,
                is_leader=is_leader,
                reg_id=reg_id,
                event_id=event_id,
                event_name=event_name,
                team_name=team_name,
                college_name=college_name,
                all_members=members,
                is_solo=is_solo,
                amount_paid=amount_paid,
                payment_id=payment_id,
                smtp_email=smtp_email,
                smtp_password=smtp_password,
                smtp_host=smtp_host,
                smtp_port=smtp_port
            )

    # Spawn thread to avoid blocking FastAPI request handling
    t = threading.Thread(target=_worker, daemon=True)
    t.start()

