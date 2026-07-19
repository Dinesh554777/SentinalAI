from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database import models, schemas
from api.auth_deps import get_current_user
from services import prediction_service, ai_service

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


@router.post("/threat-analysis")
def threat_analysis(
    payload: schemas.PredictRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    features = payload.model_dump()
    risk, risk_score, confidence, reasons, feature_importance = prediction_service.predict_user_risk(features)

    analysis = ai_service.generate_threat_analysis(
        features=features,
        risk=risk,
        risk_score=risk_score,
        confidence=confidence,
        reasons=reasons,
    )

    return {
        "risk": risk,
        "risk_score": risk_score,
        "confidence": round(confidence, 4),
        "reasons": reasons,
        "feature_importance": feature_importance,
        "ai_analysis": analysis,
        "ai_enabled": ai_service.is_configured(),
    }


@router.post("/log-analysis")
def log_analysis(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    logs = db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(limit).all()

    if not logs:
        raise HTTPException(status_code=404, detail="No logs found for analysis")

    logs_data = []
    for log in logs:
        user = db.query(models.User).filter(models.User.id == log.user_id).first()
        logs_data.append({
            "user_name": user.name if user else "Unknown",
            "login_hour": log.login_hour,
            "new_device": log.new_device,
            "new_location": log.new_location,
            "failed_logins": log.failed_logins,
            "files_downloaded": log.files_downloaded,
            "commands_executed": log.commands_executed,
            "session_duration": log.session_duration,
            "weekend_login": log.weekend_login,
            "risk": log.risk,
            "risk_score": log.risk_score,
            "timestamp": log.timestamp.isoformat() if log.timestamp else "",
        })

    analysis = ai_service.generate_log_analysis(logs_data)

    return {
        "logs_analyzed": len(logs_data),
        "analysis": analysis,
        "ai_enabled": ai_service.is_configured(),
    }


@router.get("/summary")
def security_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total_users = db.query(models.User).count()
    total_logs = db.query(models.ActivityLog).count()
    high_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "High").count()
    medium_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Medium").count()
    low_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Low").count()

    import datetime
    now = datetime.datetime.utcnow()
    active_sessions = db.query(models.UserSession).filter(
        models.UserSession.is_revoked == 0,
        models.UserSession.expires_at > now,
    ).count()

    dashboard_stats = {
        "total_users": total_users,
        "total_logs": total_logs,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "active_sessions": active_sessions,
    }

    recent_alerts_raw = db.query(models.Alert).order_by(models.Alert.timestamp.desc()).limit(10).all()
    recent_alerts = []
    for alert in recent_alerts_raw:
        user = db.query(models.User).filter(models.User.id == alert.user_id).first()
        recent_alerts.append({
            "user": user.name if user else "Unknown",
            "risk": alert.risk,
            "status": alert.status,
            "time": alert.timestamp.isoformat() if alert.timestamp else "",
        })

    recent_logs_raw = db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(10).all()
    recent_logs = []
    for log in recent_logs_raw:
        user = db.query(models.User).filter(models.User.id == log.user_id).first()
        recent_logs.append({
            "user_name": user.name if user else "Unknown",
            "risk": log.risk,
            "risk_score": log.risk_score,
            "action": _classify_action(log),
            "timestamp": log.timestamp.isoformat() if log.timestamp else "",
        })

    summary = ai_service.generate_security_summary(dashboard_stats, recent_alerts, recent_logs)

    return {
        "dashboard_stats": dashboard_stats,
        "ai_summary": summary,
        "ai_enabled": ai_service.is_configured(),
    }


@router.post("/alert-narrative")
def alert_narrative(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    log = db.query(models.ActivityLog).filter(models.ActivityLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    user = db.query(models.User).filter(models.User.id == log.user_id).first()

    features = {
        "new_device": log.new_device,
        "new_location": log.new_location,
        "failed_logins": log.failed_logins,
        "files_downloaded": log.files_downloaded,
        "commands_executed": log.commands_executed,
        "login_hour": log.login_hour,
        "weekend": log.weekend_login,
        "session_duration": log.session_duration,
    }

    action = _classify_action(log)

    narrative = ai_service.generate_alert_narrative(
        user_name=user.name if user else "Unknown",
        action=action,
        features=features,
        risk=log.risk or "Low",
        risk_score=log.risk_score or 0,
    )

    return {
        "log_id": log.id,
        "user_name": user.name if user else "Unknown",
        "risk": log.risk,
        "narrative": narrative,
        "ai_enabled": ai_service.is_configured(),
    }


@router.get("/status")
def ai_status():
    configured = ai_service.is_configured()
    return {
        "ai_enabled": configured,
        "provider": "OpenAI" if configured else "None",
        "model": ai_service.OPENAI_MODEL if configured else "N/A",
        "fallback_mode": not configured,
        "message": "AI analysis active via OpenAI GPT-4o" if configured else "Set OPENAI_API_KEY in .env to enable AI analysis. Currently using rule-based fallback.",
    }


def _classify_action(log: models.ActivityLog) -> str:
    if log.failed_logins > 0:
        return "Failed Login Attempt"
    if log.new_device and log.new_location:
        return "New Device + Location Login"
    if log.new_device:
        return "New Device Login"
    if log.new_location:
        return "Remote Access Session"
    if log.files_downloaded > 500:
        return "Bulk Data Export"
    if log.commands_executed > 20:
        return "Command Execution"
    if log.files_downloaded > 50:
        return "File Download"
    return "User Login"
