from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.alert import AlertCreate, AlertOut
from app.services.alert_service import AlertService
from app.db.models.alert import Alert as AlertModel

router = APIRouter(tags=["Alerts"])


@router.post("/alerts", response_model=AlertOut, summary="Create alert")
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    service = AlertService(db)
    created = service.create(payload)
    return created


@router.get("/alerts/{alert_id}", response_model=AlertOut, summary="Get alert")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    service = AlertService(db)
    item = service.get(alert_id)
    if not item:
        raise HTTPException(status_code=404, detail="Alert not found")
    return item


@router.post("/alerts/seed", summary="Seed a sample alert")
def seed_alert(db: Session = Depends(get_db)):
    service = AlertService(db)
    sample = AlertCreate(risk_id=1, status="new", severity="high", message="seed alert")
    created = service.create(sample)
    return {"id": created.id}
