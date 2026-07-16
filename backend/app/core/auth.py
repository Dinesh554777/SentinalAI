from datetime import timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.jwt import create_access_token, verify_access_token
from app.core.password import verify_password, get_password_hash
from app.core.security import oauth2_scheme


fake_user_db = {
    "admin": {
        "username": "admin",
        "hashed_password": get_password_hash("password"),
        "is_active": True,
    }
}


def authenticate_user(username: str, password: str) -> dict | None:
    user = fake_user_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user


def create_token_response(username: str) -> dict:
    access_token = create_access_token(subject=username)
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_access_token(token)
    username = payload.get("sub")
    user = fake_user_db.get(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"username": username, "is_active": user["is_active"]}
