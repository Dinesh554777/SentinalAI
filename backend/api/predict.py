from fastapi import APIRouter
from database import schemas
from services import prediction_service

router = APIRouter(tags=["AI Prediction"])

@router.post("/predict-risk", response_model=schemas.PredictResponse)
def predict_risk(payload: schemas.PredictRequest):
    features = payload.dict()
    risk, risk_score, reasons = prediction_service.predict_user_risk(features)
    return {
        "risk": risk,
        "risk_score": risk_score,
        "reasons": reasons
    }
