import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from database import models, schemas
from services import prediction_service
from api.auth_deps import get_current_user

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.post("")
def store_log(
    payload: schemas.LogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    features = payload.model_dump()
    risk, risk_score, confidence, reasons, feature_importance = prediction_service.predict_user_risk(features)

    new_log = models.ActivityLog(
        user_id=payload.user_id,
        login_hour=payload.login_hour,
        new_device=payload.new_device,
        new_location=payload.new_location,
        failed_logins=payload.failed_logins,
        files_downloaded=payload.files_downloaded,
        commands_executed=payload.commands_executed,
        session_duration=60,
        weekend_login=payload.weekend,
        risk=risk,
        risk_score=risk_score,
    )
    db.add(new_log)
    db.commit()

    if risk == "High":
        new_alert = models.Alert(
            user_id=payload.user_id,
            risk=risk,
            status="Active",
        )
        db.add(new_alert)
        db.commit()

    return {"message": "Log Stored", "risk": risk, "risk_score": risk_score}


@router.get("", response_model=List[schemas.LogResponse])
def get_logs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(100).all()


@router.get("/recent")
def get_recent_logs(
    since: str = Query(default="", description="ISO timestamp to fetch logs after"),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc())

    if since:
        try:
            since_dt = datetime.datetime.fromisoformat(since.replace("Z", "+00:00").replace("+00:00", ""))
            query = query.filter(models.ActivityLog.timestamp > since_dt)
        except ValueError:
            pass

    logs = query.limit(limit).all()

    result = []
    for log in logs:
        user = db.query(models.User).filter(models.User.id == log.user_id).first()

        if log.failed_logins > 0:
            action = "Failed Login Attempt"
        elif log.new_device and log.new_location:
            action = "New Device + Location Login"
        elif log.new_device:
            action = "New Device Login"
        elif log.new_location:
            action = "Remote Access Session"
        elif log.files_downloaded > 500:
            action = "Bulk Data Export"
        elif log.commands_executed > 20:
            action = "Command Execution"
        elif log.files_downloaded > 50:
            action = "File Download"
        else:
            action = "User Login"

        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_name": user.name if user else "Unknown",
            "login_hour": log.login_hour,
            "new_device": log.new_device,
            "new_location": log.new_location,
            "failed_logins": log.failed_logins,
            "files_downloaded": log.files_downloaded,
            "commands_executed": log.commands_executed,
            "session_duration": log.session_duration,
            "weekend_login": log.weekend_login,
            "risk": log.risk,
            "risk_score": log.risk_score,
            "action": action,
            "timestamp": log.timestamp.isoformat() if log.timestamp else "",
        })

    return result


@router.get("/{user_id}", response_model=List[schemas.LogResponse])
def get_user_logs(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        uid = int(user_id.replace("usr_", ""))
    except (ValueError, AttributeError):
        uid = 0
    return db.query(models.ActivityLog).filter(models.ActivityLog.user_id == uid).all()
