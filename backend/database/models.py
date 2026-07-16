import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Standard")

    logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    login_hour = Column(Integer, nullable=False)
    new_device = Column(Integer, nullable=False)  # 0 or 1
    new_location = Column(Integer, nullable=False)  # 0 or 1
    failed_logins = Column(Integer, nullable=False)
    files_downloaded = Column(Integer, nullable=False)
    commands_executed = Column(Integer, nullable=False)
    session_duration = Column(Integer, nullable=False)
    weekend_login = Column(Integer, nullable=False)  # 0 or 1
    risk = Column(String, nullable=True)
    risk_score = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="logs")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    risk = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Active")  # Active, Acknowledged

    user = relationship("User", back_populates="alerts")
