from fastapi import APIRouter

from .auth import router as auth_router
from .routes import router

api_router = APIRouter()
api_router.include_router(router)
api_router.include_router(auth_router, prefix="/auth")
