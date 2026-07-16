from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional

from app.core.auth import authenticate_user, create_token_response, get_current_user
from app.schemas.auth import Token, UserOut, LoginRequest, RegisterRequest
from app.schemas.user import UserCreate
from app.services.user_service import UserService
from app.api.deps import get_db
from sqlalchemy.orm import Session

router = APIRouter(tags=["Authentication"])


@router.post("/login", response_model=Token, summary="Login with JSON credentials")
def login(payload: LoginRequest):
    user = authenticate_user(payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return create_token_response(user)


@router.post("/token", response_model=Token, summary="Obtain access token")
def token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return create_token_response(user)


@router.post("/register", summary="Register a new user")
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    service = UserService(db)
    existing = service.get_by_email(user.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user_in = UserCreate(email=user.email, full_name=user.name, role=user.role, password=user.password)
    service.create_user(user_in)
    return {"message": "User Registered Successfully"}


@router.get("/me", response_model=UserOut, summary="Get current authenticated user")
def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/seed", summary="Create a sample user")
def seed_user(email: Optional[str] = "dev@example.com", password: Optional[str] = "devpass") -> dict:
    return {"message": "Use /auth/register to create users in the database."}
