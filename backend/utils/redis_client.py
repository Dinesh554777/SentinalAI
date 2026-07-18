import os
import redis
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
OTP_TTL_SECONDS = int(os.getenv("OTP_TTL_SECONDS", "120"))

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True,
)


def store_otp(email: str, otp: str):
    key = f"otp:{email}"
    redis_client.setex(key, OTP_TTL_SECONDS, otp)


def get_otp(email: str) -> str | None:
    key = f"otp:{email}"
    return redis_client.get(key)


def delete_otp(email: str):
    key = f"otp:{email}"
    redis_client.delete(key)


def otp_exists(email: str) -> bool:
    key = f"otp:{email}"
    return redis_client.exists(key) > 0
