import os
import datetime
import uuid
import pyotp
import qrcode
import io
import base64
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from database import models, schemas
from api.auth_deps import get_current_user
from utils import security
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

router = APIRouter(prefix="/auth", tags=["MFA"])

TOTP_ISSUER = os.getenv("TOTP_ISSUER", "SentinelAI")
MFA_ENFORCED_ROLES = [r.strip() for r in os.getenv("MFA_ENFORCED_ROLES", "Admin,DBA").split(",")]
TEMP_TOKEN_EXPIRE_MINUTES = int(os.getenv("TOTP_LOGIN_TEMP_TOKEN_EXPIRE_MINUTES", "5"))


def _is_mfa_enforced(role: str) -> bool:
    return role in MFA_ENFORCED_ROLES


def _create_temp_token(user: models.User) -> str:
    payload = {
        "sub": user.email,
        "purpose": "mfa_login",
        "exp": (datetime.datetime.utcnow() + datetime.timedelta(minutes=TEMP_TOKEN_EXPIRE_MINUTES)).timestamp(),
        "iat": datetime.datetime.utcnow().timestamp(),
        "jti": str(uuid.uuid4()),
    }
    from jose import jwt
    return jwt.encode(payload, security.SECRET_KEY, algorithm=security.ALGORITHM)


def _decode_temp_token(token: str) -> dict:
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        if payload.get("purpose") != "mfa_login":
            return None
        return payload
    except JWTError:
        return None


@router.get("/mfa/status", response_model=schemas.MfaStatusResponse)
def get_mfa_status(current_user: models.User = Depends(get_current_user)):
    return schemas.MfaStatusResponse(
        mfa_enabled=bool(current_user.mfa_enabled),
        is_enforced=_is_mfa_enforced(current_user.role),
    )


@router.post("/mfa/setup", response_model=schemas.MfaSetupResponse)
def setup_mfa(current_user: models.User = Depends(get_current_user)):
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    otpauth_url = totp.provisioning_uri(name=current_user.email, issuer_name=TOTP_ISSUER)

    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(otpauth_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    current_user.mfa_secret = secret
    db = None
    from database.database import SessionLocal
    db = SessionLocal()
    try:
        db.query(models.User).filter(models.User.id == current_user.id).update(
            {"mfa_secret": secret}
        )
        db.commit()
    finally:
        db.close()

    return schemas.MfaSetupResponse(
        secret=secret,
        otpauth_url=otpauth_url,
    )


@router.post("/mfa/enable")
def enable_mfa(
    payload: schemas.MfaEnableRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA setup required. Call /auth/mfa/setup first.",
        )

    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code. Please try again.",
        )

    current_user.mfa_enabled = 1
    db.commit()

    return {"message": "MFA enabled successfully", "mfa_enabled": True}


@router.post("/mfa/disable")
def disable_mfa(
    payload: schemas.MfaEnableRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled.",
        )

    if not current_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No MFA secret found. Please set up MFA again.",
        )

    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code. MFA was not disabled.",
        )

    if _is_mfa_enforced(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"MFA cannot be disabled for {current_user.role} role.",
        )

    current_user.mfa_enabled = 0
    db.commit()

    return {"message": "MFA disabled successfully", "mfa_enabled": False}


@router.post("/mfa/verify-login", response_model=schemas.TokenResponse)
def verify_mfa_login(
    payload: schemas.MfaVerifyRequest,
    db: Session = Depends(get_db),
):
    temp_data = _decode_temp_token(payload.temp_token)
    if not temp_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification token. Please log in again.",
        )

    email = temp_data.get("sub")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    if user.is_active == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact administrator.",
        )

    if not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not set up for this account.",
        )

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code.",
        )

    jti = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)

    session = models.UserSession(
        user_id=user.id,
        token_jti=jti,
        created_at=now,
        expires_at=expires,
    )
    db.add(session)

    max_sessions = int(os.getenv("MAX_CONCURRENT_SESSIONS", "3"))
    active_count = db.query(models.UserSession).filter(
        models.UserSession.user_id == user.id,
        models.UserSession.is_revoked == 0,
        models.UserSession.expires_at > now,
    ).count()

    if active_count >= max_sessions:
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

    token = security.create_access_token(subject=user.email, role=user.role, jti=jti)

    user.last_login = now
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    return schemas.TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.name,
        expires_in=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
