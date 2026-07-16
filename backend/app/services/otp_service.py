import random
import string
from datetime import datetime, timedelta


class OTPService:
    def generate_otp(self, length: int = 6, expire_minutes: int = 5) -> dict:
        code = "".join(random.choices(string.digits, k=length))
        expires_at = datetime.utcnow() + timedelta(minutes=expire_minutes)
        return {"otp": code, "expires_at": expires_at.isoformat()}

    def verify_otp(self, otp: str, expected_otp: str) -> bool:
        return otp == expected_otp
