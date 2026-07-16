from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.user_service import UserService
from app.services.activity_service import ActivityService
from app.services.alert_service import AlertService
from app.services.risk_service import RiskService

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard", summary="Get dashboard statistics")
def dashboard_stats(db: Session = Depends(get_db)):
    user_service = UserService(db)
    activity_service = ActivityService(db)
    alert_service = AlertService(db)
    risk_service = RiskService(db)

    return {
        "total_users": len(user_service.list_users()),
        "total_logs": len(activity_service.list()),
        "high_risk": len([r for r in risk_service.list() if r.severity == "High"]),
        "medium_risk": len([r for r in risk_service.list() if r.severity == "Medium"]),
        "low_risk": len([r for r in risk_service.list() if r.severity == "Low"]),
    }
