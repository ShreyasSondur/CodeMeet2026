import os
import smtplib
import email.utils
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple

def send_admin_otp_email(to_email: str, otp_code: str) -> Tuple[bool, str]:
    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    # Strip spaces from 16-character Google App Password if present (e.g. 'cbqa qigr sfib pvkz' -> 'cbqaqigrsfibpvkz')
    smtp_password = os.getenv("SMTP_PASSWORD", "").replace(" ", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

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

        # Connect to Gmail SMTP TLS
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, [to_email], msg.as_string())
        server.quit()

        print(f"[SUCCESS] OTP email successfully delivered to {to_email}")
        return True, "OTP email dispatched successfully"
    except smtplib.SMTPAuthenticationError as e:
        err = f"SMTP Authentication failed. Verify Google App Password: {str(e)}"
        print(f"[ERROR] {err}")
        return False, err
    except Exception as e:
        err = f"Failed to send email: {str(e)}"
        print(f"[ERROR] {err}")
        return False, err
