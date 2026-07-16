from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    entity = Column(String(255), nullable=False)
    entity_id = Column(Integer, nullable=False, index=True)
    action = Column(String(255), nullable=False)
    user_id = Column(Integer, nullable=True, index=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
