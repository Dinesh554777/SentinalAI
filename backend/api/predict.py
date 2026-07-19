from fastapi import APIRouter
from database import schemas
from services import prediction_service, ai_service

router = APIRouter(tags=["AI Prediction"])

@router.post("/predict-risk", response_model=schemas.PredictResponse)
def predict_risk(payload: schemas.PredictRequest):
    features = payload.model_dump()
    risk, risk_score, confidence, reasons, feature_importance = prediction_service.predict_user_risk(features)

    ai_narrative = None
    if ai_service.is_configured():
        analysis = ai_service.generate_threat_analysis(features, risk, risk_score, confidence, reasons)
        ai_narrative = analysis.get("summary", "")

    return {
        "risk": risk,
        "risk_score": risk_score,
        "confidence": round(confidence, 4),
        "reasons": reasons,
        "feature_importance": feature_importance,
        "ai_narrative": ai_narrative,
        "ai_enabled": ai_service.is_configured(),
    }
