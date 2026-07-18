import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from database.database import get_db
from database import models, schemas
from utils.redis_client import store_otp, get_otp, delete_otp, OTP_TTL_SECONDS
from utils import security
from services.email_service import send_otp_email, is_configured as email_configured
import datetime

router = APIRouter(prefix="/auth", tags=["OTP Verification"])


class SendOTPRequest(BaseModel):
    email: str = Field(..., min_length=5)
    purpose: str = Field(default="signup", pattern="^(signup|login|reset)$")


class VerifyOTPRequest(BaseModel):
    email: str = Field(..., min_length=5)
    otp: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(default="signup", pattern="^(signup|login|reset)$")


class SignupWithOTPRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    role: str = Field(default="Standard")


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def _create_notification(db: Session, title: str, message: str, notif_type: str = "info", user_id: int = None):
    notif = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
    )
    db.add(notif)
    db.commit()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupWithOTPRequest, db: Session = Depends(get_db)):
    existing_email = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    existing_name = db.query(models.User).filter(models.User.name == payload.name).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this name already exists.",
        )

    otp = _generate_otp()
    store_otp(payload.email, otp)

    email_sent = send_otp_email(payload.email, otp, "signup")

    response = {
        "message": f"OTP sent to {payload.email}",
        "email": payload.email,
        "expires_in": OTP_TTL_SECONDS,
        "email_sent": email_sent,
    }

    if not email_sent:
        response["otp_dev_hint"] = otp
        print(f"[OTP] Dev hint for {payload.email}: {otp}")

    return response


@router.post("/send-otp")
def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)):
    if payload.purpose == "signup":
        existing = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
    elif payload.purpose == "login":
        existing = db.query(models.User).filter(models.User.email == payload.email).first()
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email.",
            )

    otp = _generate_otp()
    store_otp(payload.email, otp)

    email_sent = send_otp_email(payload.email, otp, payload.purpose)

    response = {
        "message": f"OTP sent to {payload.email}",
        "expires_in": OTP_TTL_SECONDS,
        "email_sent": email_sent,
    }

    if not email_sent:
        response["otp_dev_hint"] = otp
        print(f"[OTP] Dev hint for {payload.email}: {otp}")

    return response


@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    stored_otp = get_otp(payload.email)

    if stored_otp is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired or was not sent. Please request a new one.",
        )

    if stored_otp != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please try again.",
        )

    delete_otp(payload.email)

    if payload.purpose == "signup":
        return {"message": "OTP verified successfully", "verified": True}

    elif payload.purpose == "login":
        user = db.query(models.User).filter(models.User.email == payload.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        jti, expires = _create_session_for_otp(db, user)
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

    return {"message": "OTP verified", "verified": True}


@router.post("/complete-signup")
def complete_signup(payload: SignupWithOTPRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Account already exists.")

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

    _create_notification(
        db,
        title="New Account Created",
        message=f"Welcome to SentinelAI, {new_user.name}! Your account has been created with {new_user.role} access.",
        notif_type="success",
        user_id=new_user.id,
    )

    jti, expires = _create_session_for_otp(db, new_user)
    token = security.create_access_token(subject=new_user.email, role=new_user.role, jti=jti)
    new_user.last_login = datetime.datetime.utcnow()
    db.commit()

    return schemas.TokenResponse(
        access_token=token,
        role=new_user.role,
        user_id=new_user.id,
        name=new_user.name,
        expires_in=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def _create_session_for_otp(db: Session, user: models.User):
    import uuid
    jti = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)

    session = models.UserSession(
        user_id=user.id,
        token_jti=jti,
        ip_address="otp-verified",
        user_agent="signup-otp",
        created_at=now,
        expires_at=expires,
    )
    db.add(session)
    db.commit()
    return jti, expires
