import uuid
import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from database.database import get_db
from database import models, schemas
from utils import security
from utils.rate_limiter import login_limiter, register_limiter
from api.auth_deps import get_current_user
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

router = APIRouter(prefix="/auth", tags=["Authentication"])

MAX_CONCURRENT_SESSIONS = int(os.getenv("MAX_CONCURRENT_SESSIONS", "3"))
LOCKOUT_THRESHOLD = 5
LOCKOUT_DURATION_MINUTES = 15


def _create_session(db: Session, user: models.User, request: Request = None):
    jti = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)

    session = models.UserSession(
        user_id=user.id,
        token_jti=jti,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent", "unknown") if request else None,
        created_at=now,
        expires_at=expires,
    )
    db.add(session)

    active_count = db.query(models.UserSession).filter(
        models.UserSession.user_id == user.id,
        models.UserSession.is_revoked == 0,
        models.UserSession.expires_at > now,
    ).count()

    if active_count >= MAX_CONCURRENT_SESSIONS:
        oldest = (
            db.query(models.UserSession)
            .filter(
                models.UserSession.user_id == user.id,
                models.UserSession.is_revoked == 0,
            )
            .order_by(models.UserSession.created_at.asc())
            .first()
        )
        if oldest:
            oldest.is_revoked = 1

    return jti, expires


def _check_lockout(user: models.User):
    if user.locked_until and user.locked_until > datetime.datetime.utcnow():
        remaining = (user.locked_until - datetime.datetime.utcnow()).seconds // 60 + 1
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account locked. Try again in {remaining} minutes.",
        )


def _record_failed_attempt(db: Session, user: models.User):
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    if user.failed_login_attempts >= LOCKOUT_THRESHOLD:
        user.locked_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        user.failed_login_attempts = 0
    db.commit()


def _reset_failed_attempts(db: Session, user: models.User):
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):
    rl_headers = login_limiter.check(request, email=payload.username)
    for k, v in rl_headers.items():
        response.headers[k] = v
    user = db.query(models.User).filter(
        (models.User.email == payload.username)
        | (models.User.email == f"{payload.username}@bank.com")
        | (models.User.name.icontains(payload.username))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if user.is_active == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact administrator.",
        )

    _check_lockout(user)

    if not security.verify_password(payload.password, user.password_hash):
        _record_failed_attempt(db, user)
        remaining = LOCKOUT_THRESHOLD - (user.failed_login_attempts or 0)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid username or password. {remaining} attempts remaining.",
        )

    _reset_failed_attempts(db, user)

    if user.mfa_enabled:
        from api.mfa import _create_temp_token
        temp_token = _create_temp_token(user)
        return {
            "mfa_required": True,
            "temp_token": temp_token,
            "access_token": None,
            "token_type": "bearer",
            "role": user.role,
            "user_id": user.id,
            "name": user.name,
            "expires_in": 0,
        }

    jti, expires = _create_session(db, user, request)

    token = security.create_access_token(subject=user.email, role=user.role, jti=jti)

    user.last_login = datetime.datetime.utcnow()
    db.commit()

    return schemas.TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.name,
        expires_in=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserRegister, request: Request, response: Response, db: Session = Depends(get_db)):
    rl_headers = register_limiter.check(request, email=payload.email)
    for k, v in rl_headers.items():
        response.headers[k] = v
    existing_email = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please use a different email.",
        )

    existing_name = db.query(models.User).filter(models.User.name == payload.name).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this name already exists. Please choose a different name.",
        )

    hashed_password = security.get_password_hash(payload.password)
    new_user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed_password,
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}


@router.post("/logout")
def logout(request: Request, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_header = request.headers.get("authorization", "")
    token = auth_header.replace("Bearer ", "")
    payload = security.decode_access_token(token)
    jti = payload.get("jti") if payload else None

    if jti:
        db.query(models.UserSession).filter(
            models.UserSession.token_jti == jti,
            models.UserSession.user_id == current_user.id,
        ).update({"is_revoked": 1})
    else:
        db.query(models.UserSession).filter(
            models.UserSession.user_id == current_user.id,
            models.UserSession.is_revoked == 0,
        ).update({"is_revoked": 1})
    db.commit()
    return {"message": "Logged out successfully"}


@router.get("/sessions", response_model=list[schemas.SessionResponse])
def get_active_sessions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.datetime.utcnow()
    sessions = (
        db.query(models.UserSession)
        .filter(
            models.UserSession.user_id == current_user.id,
            models.UserSession.is_revoked == 0,
            models.UserSession.expires_at > now,
        )
        .order_by(models.UserSession.created_at.desc())
        .all()
    )
    return sessions


@router.delete("/sessions/{session_id}")
def revoke_session(session_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = (
        db.query(models.UserSession)
        .filter(
            models.UserSession.id == session_id,
            models.UserSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_revoked = 1
    db.commit()
    return {"message": "Session revoked"}


@router.post("/sessions/revoke-all")
def revoke_all_sessions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(models.UserSession).filter(
        models.UserSession.user_id == current_user.id,
        models.UserSession.is_revoked == 0,
    ).update({"is_revoked": 1})
    db.commit()
    return {"message": "All sessions revoked"}


@router.get("/me", response_model=schemas.UserDetailsResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
