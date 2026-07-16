from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database import models, schemas

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_logs = db.query(models.ActivityLog).count()
    
    high_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "High").count()
    medium_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Medium").count()
    low_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Low").count()

    return {
        "total_users": total_users,
        "total_logs": total_logs,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk
    }
