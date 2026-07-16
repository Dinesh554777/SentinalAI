from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.jwt import create_access_token, verify_access_token
from app.core.password import verify_password
from app.core.security import oauth2_scheme
from app.api.deps import get_db
from app.repositories.user_repository import UserRepository


def authenticate_user(db: Session, email: str, password: str) -> dict | None:
    repo = UserRepository(db)
    user = repo.get_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return {"email": user.email, "role": user.role, "is_active": bool(user.is_active)}


def create_token_response(user: dict) -> dict:
    access_token = create_access_token(subject=user["email"])
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.get("role"),
    }


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_access_token(token)
    email = payload.get("sub")
    repo = UserRepository(db)
    user = repo.get_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"username": user.email, "role": user.role, "is_active": bool(user.is_active)}
