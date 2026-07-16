from sqlalchemy.orm import Session

from app.db.models.risk import Risk


class RiskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, risk_id: int) -> Risk | None:
        return self.db.query(Risk).filter(Risk.id == risk_id).first()

    def create(self, risk: Risk) -> Risk:
        self.db.add(risk)
        self.db.commit()
        self.db.refresh(risk)
        return risk
