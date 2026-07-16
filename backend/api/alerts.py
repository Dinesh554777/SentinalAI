from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from database import models

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.Alert).order_by(models.Alert.timestamp.desc()).all()
    response = []
    for alert in alerts:
        formatted_time = alert.timestamp.strftime("%Y-%m-%d %H:%M")
        response.append({
            "id": alert.id,
            "user": alert.user.name,
            "risk": alert.risk,
            "time": formatted_time,
            "status": alert.status
        })
    return response


@router.post("/{id}/acknowledge")
def acknowledge_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "Acknowledged"
    db.commit()
    return {"message": "Alert Acknowledged"}
