from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.services.user_service import UserService

router = APIRouter(tags=["Users"])


@router.post("/users", response_model=UserOut, summary="Create a new user")
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    created = service.create_user(user_in)
    return created


@router.get("/users", response_model=list[UserOut], summary="List all users")
def list_users(db: Session = Depends(get_db)):
    service = UserService(db)
    return service.list_users()


@router.get("/users/{user_id}", response_model=UserOut, summary="Get user by ID")
def get_user(user_id: int, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserOut, summary="Update a user")
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    service = UserService(db)
    updated = service.update_user(user_id, user_in)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.delete("/users/{user_id}", summary="Delete a user")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    service = UserService(db)
    deleted = service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


@router.post("/seed-db", summary="Seed a sample DB user")
def seed_db_user(db: Session = Depends(get_db)):
    service = UserService(db)
    sample = UserCreate(email="dev@example.com", full_name="Dev User", role="admin", password="devpass")
    created = service.create_user(sample)
    return {"id": created.id, "email": created.email}
