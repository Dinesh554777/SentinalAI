from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.activity import ActivityCreate, ActivityOut
from app.services.activity_service import ActivityService
from app.db.models.activity import Activity as ActivityModel

router = APIRouter(tags=["Activity"])


@router.post("/activities", response_model=ActivityOut, summary="Create activity")
def create_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    service = ActivityService(db)
    created = service.create(payload)
    return created


@router.get("/activities/{activity_id}", response_model=ActivityOut, summary="Get activity")
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    service = ActivityService(db)
    item = service.get(activity_id)
    if not item:
        raise HTTPException(status_code=404, detail="Activity not found")
    return item


@router.post("/activities/seed", summary="Seed a sample activity")
def seed_activity(db: Session = Depends(get_db)):
    service = ActivityService(db)
    sample = ActivityCreate(user_id=1, action="login", description="seed activity")
    created = service.create(sample)
    return {"id": created.id}
