import os
import time
import redis
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
OTP_TTL_SECONDS = int(os.getenv("OTP_TTL_SECONDS", "120"))

try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True,
        socket_connect_timeout=2,
    )
    redis_client.ping()
    REDIS_AVAILABLE = True
    print("[Redis] Connected successfully")
except Exception as e:
    redis_client = None
    REDIS_AVAILABLE = False
    print(f"[Redis] Not available ({e}) — using in-memory fallback for OTP")

_otp_store: dict[str, tuple[str, float]] = {}


def store_otp(email: str, otp: str):
    if REDIS_AVAILABLE and redis_client is not None:
        key = f"otp:{email}"
        redis_client.setex(key, OTP_TTL_SECONDS, otp)
    else:
        _otp_store[email] = (otp, time.time() + OTP_TTL_SECONDS)


def get_otp(email: str) -> str | None:
    if REDIS_AVAILABLE and redis_client is not None:
        key = f"otp:{email}"
        return redis_client.get(key)
    entry = _otp_store.get(email)
    if entry is None:
        return None
    otp, expires_at = entry
    if time.time() > expires_at:
        _otp_store.pop(email, None)
        return None
    return otp


def delete_otp(email: str):
    if REDIS_AVAILABLE and redis_client is not None:
        key = f"otp:{email}"
        redis_client.delete(key)
    else:
        _otp_store.pop(email, None)


def otp_exists(email: str) -> bool:
    if REDIS_AVAILABLE and redis_client is not None:
        key = f"otp:{email}"
        return redis_client.exists(key) > 0
    return get_otp(email) is not None
