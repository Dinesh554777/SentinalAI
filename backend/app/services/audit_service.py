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
class AuditService:
    def log_audit(self, entity: str, entity_id: int, action: str, user_id: int | None = None, details: str | None = None) -> dict:
        return {
            "entity": entity,
            "entity_id": entity_id,
            "action": action,
            "user_id": user_id,
            "details": details,
        }
