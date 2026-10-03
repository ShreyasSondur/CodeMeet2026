import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple

def send_admin_otp_email(to_email: str, otp_code: str) -> Tuple[bool, str]:
    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    # Always log OTP to server console for backup / dev debugging
    print(f"\n========================================================")
    print(f"🔒 [CODEMEET 2026 2FA SECURITY] ADMIN OTP: {otp_code}")
    print(f"📧 Destination Email: {to_email}")
    print(f"⏱️ Validity: 5 Minutes")
    print(f"========================================================\n")

    if not smtp_email or not smtp_password:
        return True, "OTP generated (Console mode: Add SMTP_EMAIL and SMTP_PASSWORD to backend/.env to send real emails)"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🔐 {otp_code} - CODEMEET 2026 Admin 2FA Security Code"
        msg["From"] = f"CodeMeet 2026 Security <{smtp_email}>"
        msg["To"] = to_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050507; color: #ffffff; padding: 24px; }}
            .container {{ max-width: 520px; margin: 0 auto; background-color: #0c0e14; border: 1px solid #ccff00; border-radius: 16px; padding: 32px; box-shadow: 0 0 40px rgba(204, 255, 0, 0.15); }}
            .badge {{ display: inline-block; background-color: rgba(204, 255, 0, 0.15); color: #ccff00; border: 1px solid #ccff00; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; }}
            .title {{ font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 8px; letter-spacing: 0.5px; }}
            .desc {{ font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }}
            .otp-box {{ background-color: #000000; border: 2px dashed #ccff00; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }}
            .otp-code {{ font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #ccff00; }}
            .warning {{ font-size: 11px; color: #71717a; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px; text-align: center; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">// 2FA AUTHENTICATION PROTOCOL</div>
            <div class="title">CODEMEET 2026 ADMIN ACCESS</div>
            <p class="desc">A login attempt was initiated on the <strong>/idk</strong> admin console. Use the one-time security passcode below to complete your authorization.</p>
            
            <div class="otp-box">
              <div class="otp-code">{otp_code}</div>
            </div>
            
            <p class="desc" style="font-size: 12px; color: #fbbf24;">⚠️ This code expires in <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            
            <div class="warning">
              Srinivas University Institute of Engineering and Technology (SUIET), Mukka<br>
              Official CODEMEET 2026 Admin Portal Security Engine
            </div>
          </div>
        </body>
        </html>
        """

        part = MIMEText(html_content, "html")
        msg.attach(part)

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, [to_email], msg.as_string())
        server.quit()

        return True, "OTP email dispatched successfully"
    except Exception as e:
        print(f"❌ Error dispatching OTP email: {e}")
        return False, f"Failed to send email: {str(e)}"
