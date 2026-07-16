from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

DATABASE_URL = getattr(settings, "database_url", "sqlite:///./sentinelai.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

Base = declarative_base()
