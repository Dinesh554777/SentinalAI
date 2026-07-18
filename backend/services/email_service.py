import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_NAME = os.getenv("FROM_NAME", "SentinelAI")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


def is_configured() -> bool:
    return bool(SMTP_USER and SMTP_PASSWORD)


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not is_configured():
        print(f"[Email] SMTP not configured. Would send to {to_email}: {subject}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        text_part = MIMEText(html_body, "plain")
        msg.attach(text_part)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())

        print(f"[Email] Sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[Email] Failed to send to {to_email}: {e}")
        return False


def send_otp_email(to_email: str, otp_code: str, purpose: str = "verification") -> bool:
    subject = f"SentinelAI — Your {purpose.title()} Code"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:linear-gradient(135deg,#111118 0%,#0d1117 100%);border-radius:16px;border:1px solid rgba(99,102,241,0.15);overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(90deg,#6366f1,#3b82f6);padding:24px 32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">
            &#128737; SentinelAI
          </h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">
            AI-Powered Security Platform
          </p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <h2 style="margin:0 0 8px;color:#e2e8f0;font-size:18px;font-weight:600;">
            Your Verification Code
          </h2>
          <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.5;">
            Use the code below to complete your {purpose}. This code expires in <strong style="color:#e2e8f0;">2 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px 24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 8px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:2px;">
              Verification Code
            </p>
            <p style="margin:0;font-size:36px;font-weight:800;color:#818cf8;letter-spacing:12px;font-family:'Courier New',monospace;">
              {otp_code}
            </p>
          </div>

          <!-- Warning -->
          <div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.15);border-radius:8px;padding:12px 16px;margin-bottom:24px;">
            <p style="margin:0;color:#d4a017;font-size:12px;line-height:1.5;">
              &#9888;&#65039; <strong>Do not share</strong> this code with anyone. SentinelAI staff will never ask for your code.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top:1px solid rgba(99,102,241,0.1);padding:16px 32px;text-align:center;">
          <p style="margin:0;color:#475569;font-size:11px;">
            This is an automated message from SentinelAI Security Platform.
          </p>
        </div>
      </div>
    </body>
    </html>
    """

    return send_email(to_email, subject, html_body)


def send_alert_email(to_email: str, alert_type: str, user_name: str, risk: str, score: int) -> bool:
    color = "#ef4444" if risk == "High" else "#eab308"
    subject = f"[{risk} Risk] SentinelAI Security Alert — {alert_type}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:linear-gradient(135deg,#111118 0%,#0d1117 100%);border-radius:16px;border:1px solid {color}33;overflow:hidden;">
        <div style="background:linear-gradient(90deg,{color},{color}aa);padding:20px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:18px;">&#128680; Security Alert</h1>
        </div>
        <div style="padding:28px 32px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
            <span style="background:{color}22;color:{color};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
              {risk} Risk — Score: {score}
            </span>
          </div>
          <h2 style="margin:0 0 8px;color:#e2e8f0;font-size:16px;">{alert_type}</h2>
          <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.5;">
            Suspicious activity detected for user <strong style="color:#e2e8f0;">{user_name}</strong>.
            Immediate review is recommended.
          </p>
          <a href="http://localhost:5173/alerts" style="display:inline-block;background:linear-gradient(90deg,#6366f1,#3b82f6);color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
            View Alert →
          </a>
        </div>
        <div style="border-top:1px solid rgba(99,102,241,0.1);padding:14px 32px;text-align:center;">
          <p style="margin:0;color:#475569;font-size:11px;">SentinelAI Security Platform</p>
        </div>
      </div>
    </body>
    </html>
    """

    return send_email(to_email, subject, html_body)
