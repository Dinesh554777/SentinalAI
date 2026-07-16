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
    def list(self) -> list[AlertModel]:
        return self.repo.list_all()
    def acknowledge(self, alert_id: int) -> AlertModel | None:
        alert = self.repo.get_by_id(alert_id)
        if alert:
            alert.status = "acknowledged"
            self.db.commit()
            self.db.refresh(alert)
        return alert
