from fastapi import APIRouter, Depends, HTTPException, status
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
    risk, risk_score, reasons = prediction_service.predict_user_risk(features)

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
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).all()


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
