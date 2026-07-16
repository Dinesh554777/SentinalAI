from sqlalchemy.orm import Session

from app.repositories.audit_repository import AuditRepository
from app.schemas.audit import AuditCreate
from app.db.models.audit import Audit as AuditModel


class AuditService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AuditRepository(db)

    def create(self, payload: AuditCreate) -> AuditModel:
        model = AuditModel(**payload.model_dump())
        return self.repo.create(model)

    def get(self, audit_id: int) -> AuditModel | None:
        return self.repo.get_by_id(audit_id)
    def list(self) -> list[AuditModel]:
        return self.repo.list_all()
