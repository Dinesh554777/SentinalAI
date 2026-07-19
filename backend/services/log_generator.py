import random
import datetime
import asyncio
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database import models
from services import prediction_service
from services import ai_service

DEVICES = ["Windows PC", "MacBook Pro", "Linux Server", "Android Phone", "iOS Tablet", "SSH Terminal"]
LOCATIONS = ["HQ Office", "Remote VPN", "Data Center", "Branch Office", "Home Network", "Cloud AWS"]
IPS = [
    "192.168.1." + str(random.randint(10, 250)),
    "10.0." + str(random.randint(1, 50)) + "." + str(random.randint(1, 250)),
    "172.16." + str(random.randint(1, 30)) + "." + str(random.randint(1, 250)),
]

ACTIONS = [
    {"action": "User Login", "weight": 25, "new_device": 0, "new_location": 0, "failed_logins": 0, "files": (0, 5), "cmds": (0, 3)},
    {"action": "File Download", "weight": 15, "new_device": 0, "new_location": 0, "failed_logins": 0, "files": (10, 200), "cmds": (0, 2)},
    {"action": "Database Query", "weight": 15, "new_device": 0, "new_location": 0, "failed_logins": 0, "files": (0, 3), "cmds": (2, 15)},
    {"action": "Command Execution", "weight": 12, "new_device": 0, "new_location": 0, "failed_logins": 0, "files": (0, 10), "cmds": (5, 40)},
    {"action": "Failed Login Attempt", "weight": 8, "new_device": 0, "new_location": 0, "failed_logins": (1, 5), "files": (0, 0), "cmds": (0, 0)},
    {"action": "New Device Login", "weight": 8, "new_device": 1, "new_location": 0, "failed_logins": 0, "files": (0, 10), "cmds": (0, 5)},
    {"action": "Remote Access Session", "weight": 7, "new_device": 0, "new_location": 1, "failed_logins": 0, "files": (0, 50), "cmds": (1, 20)},
    {"action": "Privilege Escalation", "weight": 3, "new_device": 1, "new_location": 1, "failed_logins": (2, 6), "files": (0, 20), "cmds": (10, 50)},
    {"action": "Bulk Data Export", "weight": 3, "new_device": 0, "new_location": 0, "failed_logins": 0, "files": (500, 3000), "cmds": (0, 5)},
    {"action": "Configuration Change", "weight": 4, "new_device": 0, "new_location": 0, "failed_logins": 0, "files": (0, 5), "cmds": (3, 15)},
]

STATUSES = ["Success", "Success", "Success", "Success", "Failed", "Denied"]


def _pick_action():
    total = sum(a["weight"] for a in ACTIONS)
    r = random.uniform(0, total)
    cumulative = 0
    for a in ACTIONS:
        cumulative += a["weight"]
        if r <= cumulative:
            return a
    return ACTIONS[0]


def _pick_value(val):
    if isinstance(val, tuple):
        return random.randint(val[0], val[1])
    return val


def generate_log_entry(db: Session):
    user = db.query(models.User).filter(models.User.is_active == 1).all()
    if not user:
        return None

    selected_user = random.choice(user)
    action_cfg = _pick_action()
    now = datetime.datetime.utcnow()
    hour = now.hour

    new_device = _pick_value(action_cfg["new_device"]) if action_cfg["new_device"] != 0 else (1 if random.random() < 0.1 else 0)
    new_location = _pick_value(action_cfg["new_location"]) if action_cfg["new_location"] != 0 else (1 if random.random() < 0.08 else 0)
    failed_logins = _pick_value(action_cfg["failed_logins"])
    files_down = _pick_value(action_cfg["files"])
    cmds = _pick_value(action_cfg["cmds"])

    features = {
        "new_device": new_device,
        "new_location": new_location,
        "failed_logins": failed_logins,
        "files_downloaded": files_down,
        "commands_executed": cmds,
        "login_hour": hour,
        "weekend": 1 if now.weekday() >= 5 else 0,
    }

    risk, risk_score, confidence, reasons, importances = prediction_service.predict_user_risk(features)

    status = "Success"
    if risk == "High" and random.random() < 0.4:
        status = random.choice(["Failed", "Denied"])
    elif failed_logins > 0:
        status = "Failed"

    log = models.ActivityLog(
        user_id=selected_user.id,
        login_hour=hour,
        new_device=new_device,
        new_location=new_location,
        failed_logins=failed_logins,
        files_downloaded=files_down,
        commands_executed=cmds,
        session_duration=random.randint(5, 180),
        weekend_login=features["weekend"],
        risk=risk,
        risk_score=risk_score,
    )
    db.add(log)

    if risk == "High":
        alert = models.Alert(
            user_id=selected_user.id,
            risk=risk,
            status="Active",
        )
        db.add(alert)

        if ai_service.is_configured():
            notification_message = ai_service.generate_notification_message(
                user_name=selected_user.name,
                risk=risk,
                risk_score=risk_score,
                features=features,
            )
        else:
            notification_message = f"{selected_user.name} triggered a high-risk event (score: {risk_score}). Device: {random.choice(DEVICES)}, IP: {random.choice(IPS)}. Immediate review recommended."

        notif = models.Notification(
            user_id=selected_user.id,
            title=f"High Risk Alert — {action_cfg['action']}",
            message=notification_message,
            type="alert",
        )
        db.add(notif)
    elif risk == "Medium":
        if ai_service.is_configured():
            notification_message = ai_service.generate_notification_message(
                user_name=selected_user.name,
                risk=risk,
                risk_score=risk_score,
                features=features,
            )
        else:
            notification_message = f"{selected_user.name} triggered a medium-risk event (score: {risk_score})."

        notif = models.Notification(
            user_id=selected_user.id,
            title=f"Medium Risk — {action_cfg['action']}",
            message=notification_message,
            type="warning",
        )
        db.add(notif)

    db.commit()
    db.refresh(log)

    return {
        "id": log.id,
        "user_id": log.user_id,
        "user_name": selected_user.name,
        "action": action_cfg["action"],
        "device": random.choice(DEVICES),
        "location": random.choice(LOCATIONS),
        "ip_address": random.choice(IPS),
        "files_downloaded": files_down,
        "commands_executed": cmds,
        "failed_logins": failed_logins,
        "risk_score": risk_score,
        "risk": risk,
        "status": status,
        "timestamp": log.timestamp.isoformat() if log.timestamp else now.isoformat(),
    }


async def background_log_generator():
    print("[Background] Log generator started")
    while True:
        try:
            db = SessionLocal()
            try:
                generate_log_entry(db)
            finally:
                db.close()
        except Exception as e:
            print(f"[Background] Log generation error: {e}")

        await asyncio.sleep(random.uniform(3, 8))
