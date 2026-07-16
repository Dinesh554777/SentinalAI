import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.base import init_db


def create_app() -> FastAPI:
    setup_logging()
    init_db()
    app = FastAPI(
        title=settings.project_name,
        version=settings.api_version,
        debug=settings.debug,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=f"/api/{settings.api_version}")
    logging.getLogger(__name__).info("Starting SentinelAI application")
    return app


app = create_app()
