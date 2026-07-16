import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta

from app.core.config import settings


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(message: bytes, secret: str) -> str:
    signature = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).digest()
    return _base64url_encode(signature)


def create_access_token(subject: str, expires_delta: int | None = None) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_delta or settings.access_token_expire_minutes)
    header = {"alg": settings.jwt_algorithm, "typ": "JWT"}
    payload = {"sub": subject, "exp": int(expire.timestamp())}

    encoded_header = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    encoded_payload = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = _sign(f"{encoded_header}.{encoded_payload}".encode("utf-8"), settings.secret_key)
    return f"{encoded_header}.{encoded_payload}.{signature}"


def verify_access_token(token: str) -> dict:
    try:
        encoded_header, encoded_payload, signature = token.split(".")
        message = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        expected_signature = _sign(message, settings.secret_key)
        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError("Invalid token signature")

        payload_bytes = _base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes)
        if int(payload.get("exp", 0)) < int(datetime.utcnow().timestamp()):
            raise ValueError("Token expired")

        return payload
    except Exception as exc:
        raise ValueError("Invalid access token") from exc
