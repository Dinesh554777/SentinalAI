from sqlalchemy.orm import Session

from app.db.models.audit import Audit


class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, audit_id: int) -> Audit | None:
        return self.db.query(Audit).filter(Audit.id == audit_id).first()

    def list_all(self) -> list[Audit]:
        return self.db.query(Audit).all()

    def create(self, audit: Audit) -> Audit:
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(audit)
        return audit
