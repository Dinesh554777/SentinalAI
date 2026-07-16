import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database.database import get_db
from database import models

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
def get_reports(db: Session = Depends(get_db)):
    logs = db.query(models.ActivityLog).all()
    alerts = db.query(models.Alert).all()
    return {
        "generated_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "total_logs": len(logs),
            "total_alerts": len(alerts),
            "high_risk_logs": sum(1 for l in logs if l.risk == "High")
        }
    }


@router.get("/download")
def download_report(db: Session = Depends(get_db)):
    logs = db.query(models.ActivityLog).all()
    csv_content = "ID,User ID,Risk,Score,Device,Location,Failed Logins,Downloads,Commands,Hour,Weekend\n"
    for log in logs:
        csv_content += f"{log.id},{log.user_id},{log.risk},{log.risk_score},{log.new_device},{log.new_location},{log.failed_logins},{log.files_downloaded},{log.commands_executed},{log.login_hour},{log.weekend_login}\n"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinal_report.csv"}
    )
