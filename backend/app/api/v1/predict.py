from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.prediction import PredictionRequest
from app.schemas.risk import RiskCreate, RiskOut
from app.services.risk_service import RiskService

router = APIRouter(tags=["Prediction"])


@router.post("/predict-risk", response_model=RiskOut, summary="Predict insider threat risk")
def predict_risk(payload: PredictionRequest, db: Session = Depends(get_db)):
    service = RiskService(db)

    score = min(
        100,
        payload.new_device * 20
        + payload.new_location * 20
        + payload.failed_logins * 5
        + min(payload.files_downloaded, 100) * 0.2
        + min(payload.commands_executed, 100) * 0.2
        + (payload.login_hour >= 22 or payload.login_hour <= 4) * 20
        + (1 if payload.weekend else 0) * 10,
    )
    severity = "Low"
    if score >= 75:
        severity = "High"
    elif score >= 40:
        severity = "Medium"

    return service.create(
        payload=RiskCreate(
            name="predicted-risk",
            severity=severity,
            score=score,
            details=f"Predicted from activity {payload.action}",
        )
    )
