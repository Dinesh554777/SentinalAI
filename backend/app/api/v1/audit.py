from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.audit import AuditCreate, AuditOut
from app.services.audit_service import AuditService
from app.db.models.audit import Audit as AuditModel

router = APIRouter(tags=["Audits"])


@router.post("/audits", response_model=AuditOut, summary="Create audit")
def create_audit(payload: AuditCreate, db: Session = Depends(get_db)):
    service = AuditService(db)
    created = service.create(payload)
    return created


@router.get("/audits", response_model=list[AuditOut], summary="List all audits")
def list_audits(db: Session = Depends(get_db)):
    service = AuditService(db)
    return service.list()


@router.get("/audits/{audit_id}", response_model=AuditOut, summary="Get audit")
def get_audit(audit_id: int, db: Session = Depends(get_db)):
    service = AuditService(db)
    item = service.get(audit_id)
    if not item:
        raise HTTPException(status_code=404, detail="Audit not found")
    return item


@router.post("/audits/seed", summary="Seed a sample audit")
def seed_audit(db: Session = Depends(get_db)):
    service = AuditService(db)
    sample = AuditCreate(entity="user", entity_id=1, action="create", user_id=1, details="seed audit")
    created = service.create(sample)
    return {"id": created.id}
