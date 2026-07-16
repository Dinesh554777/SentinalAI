from datetime import datetime, timedelta

from app.core.auth import create_token_response, verify_password
from app.db.models.user import User


class AuthService:
    def authenticate(self, username: str, password: str) -> dict | None:
        # Placeholder authentication logic
        return create_token_response(username)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return verify_password(plain_password, hashed_password)

    def create_access_token(self, username: str, expires_delta: int | None = None) -> dict:
        return create_token_response(username)
