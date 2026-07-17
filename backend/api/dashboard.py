import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.database import get_db
from database import models, schemas
from api.auth_deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_users = db.query(models.User).count()
    total_logs = db.query(models.ActivityLog).count()

    high_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "High").count()
    medium_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Medium").count()
    low_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Low").count()

    now = datetime.datetime.utcnow()
    active_sessions = db.query(models.UserSession).filter(
        models.UserSession.is_revoked == 0,
        models.UserSession.expires_at > now,
    ).count()

    return {
        "total_users": total_users,
        "total_logs": total_logs,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "active_sessions": active_sessions,
    }
