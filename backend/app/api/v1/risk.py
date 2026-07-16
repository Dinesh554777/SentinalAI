from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.risk import RiskCreate, RiskOut
from app.services.risk_service import RiskService
from app.db.models.risk import Risk as RiskModel

router = APIRouter(tags=["Risks"])


@router.post("/risks", response_model=RiskOut, summary="Create risk")
def create_risk(payload: RiskCreate, db: Session = Depends(get_db)):
    service = RiskService(db)
    created = service.create(payload)
    return created


@router.get("/risks/{risk_id}", response_model=RiskOut, summary="Get risk")
def get_risk(risk_id: int, db: Session = Depends(get_db)):
    service = RiskService(db)
    item = service.get(risk_id)
    if not item:
        raise HTTPException(status_code=404, detail="Risk not found")
    return item


@router.post("/risks/seed", summary="Seed a sample risk")
def seed_risk(db: Session = Depends(get_db)):
    service = RiskService(db)
    sample = RiskCreate(name="Test Risk", severity="medium", score=42.0, details="seed risk")
    created = service.create(sample)
    return {"id": created.id}
