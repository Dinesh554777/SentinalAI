from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.alert import AlertCreate, AlertOut
from app.services.alert_service import AlertService

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=list[AlertOut], summary="List all alerts")
def list_alerts(db: Session = Depends(get_db)):
    service = AlertService(db)
    return service.list()


@router.post("/alerts/{alert_id}/acknowledge", summary="Acknowledge an alert")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    service = AlertService(db)
    alert = service.acknowledge(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert Acknowledged"}
