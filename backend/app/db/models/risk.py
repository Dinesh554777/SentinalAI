from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    severity = Column(String(64), nullable=False)
    score = Column(Float, nullable=False)
    details = Column(Text, nullable=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
