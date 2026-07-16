from fastapi import APIRouter

from .auth import router as auth_router
from .routes import router
from .users import router as users_router
from .activity import router as activity_router
from .alert import router as alert_router
from .alerts import router as alerts_list_router
from .audit import router as audit_router
from .risk import router as risk_router
from .logs import router as logs_router
from .dashboard import router as dashboard_router
from .predict import router as predict_router

api_router = APIRouter()
api_router.include_router(router)
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(users_router)
api_router.include_router(activity_router)
api_router.include_router(alert_router)
api_router.include_router(alerts_list_router)
api_router.include_router(audit_router)
api_router.include_router(risk_router)
api_router.include_router(logs_router)
api_router.include_router(dashboard_router)
api_router.include_router(predict_router)
