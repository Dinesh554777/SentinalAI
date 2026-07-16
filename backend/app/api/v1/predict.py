from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.activity import ActivityCreate
from app.schemas.risk import RiskOut
from app.services.risk_service import RiskService

router = APIRouter(tags=["Prediction"])


@router.post("/predict-risk", response_model=RiskOut, summary="Predict insider threat risk")
def predict_risk(payload: ActivityCreate, db: Session = Depends(get_db)):
    service = RiskService(db)
    # Simple placeholder logic: generate risk classification from activity inputs.
    score = min(
        100,
        payload.new_device * 20
        + payload.new_location * 20
        + payload.failed_logins * 5
        + min(payload.files_downloaded, 100) * 0.1
        + min(payload.commands_executed, 100) * 0.1
        + (payload.login_hour >= 22 or payload.login_hour <= 4) * 20
        + payload.weekend * 10,
    )
    severity = "Low"
    if score >= 75:
        severity = "High"
    elif score >= 40:
        severity = "Medium"

    return service.create(
        payload=RiskCreate(name="predicted-risk", severity=severity, score=score, details="Predicted from activity log"),
    )
