from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"/api/{settings.api_version}/auth/token"
)
