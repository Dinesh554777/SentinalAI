from typing import Generator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserOut
from app.db.session import SessionLocal
from app.services.user_service import UserService

router = APIRouter(tags=["Users"])


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/users", response_model=UserOut, summary="Create a new user")
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    created = service.create_user(user_in)
    return created


@router.get("/users/{user_id}", response_model=UserOut, summary="Get user by ID")
def get_user(user_id: int, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/seed-db", summary="Seed a sample DB user")
def seed_db_user(db: Session = Depends(get_db)):
    service = UserService(db)
    sample = UserCreate(email="dev@example.com", full_name="Dev User", password="devpass")
    created = service.create_user(sample)
    return {"id": created.id, "email": created.email}
