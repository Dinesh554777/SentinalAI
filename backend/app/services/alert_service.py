from sqlalchemy.orm import Session

from app.repositories.alert_repository import AlertRepository
from app.schemas.alert import AlertCreate
from app.db.models.alert import Alert as AlertModel


class AlertService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AlertRepository(db)

    def create(self, payload: AlertCreate) -> AlertModel:
        model = AlertModel(**payload.model_dump())
        return self.repo.create(model)

    def get(self, alert_id: int) -> AlertModel | None:
        return self.repo.get_by_id(alert_id)
class AlertService:
    def create_alert(self, risk_id: int, status: str, severity: str, message: str | None = None) -> dict:
        return {"risk_id": risk_id, "status": status, "severity": severity, "message": message}
