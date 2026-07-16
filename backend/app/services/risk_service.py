from sqlalchemy.orm import Session

from app.repositories.risk_repository import RiskRepository
from app.schemas.risk import RiskCreate
from app.db.models.risk import Risk as RiskModel


class RiskService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RiskRepository(db)

    def create(self, payload: RiskCreate) -> RiskModel:
        model = RiskModel(**payload.model_dump())
        return self.repo.create(model)

    def get(self, risk_id: int) -> RiskModel | None:
        return self.repo.get_by_id(risk_id)
    def list(self) -> list[RiskModel]:
        return self.repo.list_all()
