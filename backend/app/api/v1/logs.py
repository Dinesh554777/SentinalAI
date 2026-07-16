from typing import Generator

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.activity import ActivityCreate, ActivityOut
from app.services.activity_service import ActivityService

router = APIRouter(tags=["Logs"])


@router.post("/logs", response_model=ActivityOut, summary="Store a privileged access activity log")
def create_log(payload: ActivityCreate, db: Session = Depends(get_db)):
    service = ActivityService(db)
    return service.create(payload)


@router.get("/logs", response_model=list[ActivityOut], summary="List all activity logs")
def list_logs(db: Session = Depends(get_db)):
    service = ActivityService(db)
    return service.list()


@router.get("/logs/{user_id}", response_model=list[ActivityOut], summary="Get logs for a specific user")
def get_logs_by_user(user_id: int, db: Session = Depends(get_db)):
    service = ActivityService(db)
    return service.list_by_user(user_id)
