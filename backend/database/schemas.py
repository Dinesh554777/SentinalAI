from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

# -----------------------------------------------
# Auth Schemas
# -----------------------------------------------
class UserLogin(BaseModel):
    username: str  # maps to email in the DB
    password: str

class TokenResponse(BaseModel):
    access_token: str
    role: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str

# -----------------------------------------------
# User Schemas
# -----------------------------------------------
class UserResponse(BaseModel):
    id: int
    name: str
    role: str

    class Config:
        orm_mode = True

class UserDetailsResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

# -----------------------------------------------
# Activity Log Schemas
# -----------------------------------------------
class LogCreate(BaseModel):
    user_id: int
    new_device: int = Field(..., ge=0, le=1)
    new_location: int = Field(..., ge=0, le=1)
    failed_logins: int = Field(..., ge=0)
    files_downloaded: int = Field(..., ge=0)
    commands_executed: int = Field(..., ge=0)
    login_hour: int = Field(..., ge=0, le=23)
    weekend: int = Field(..., ge=0, le=1)  # API design requested "weekend" instead of weekend_login

class LogResponse(BaseModel):
    id: int
    user_id: int
    login_hour: int
    new_device: int
    new_location: int
    failed_logins: int
    files_downloaded: int
    commands_executed: int
    session_duration: int
    weekend_login: int
    risk: Optional[str]
    risk_score: Optional[int]
    timestamp: datetime.datetime

    class Config:
        orm_mode = True

# -----------------------------------------------
# Predict Schema
# -----------------------------------------------
class PredictRequest(BaseModel):
    new_device: int = Field(..., ge=0, le=1)
    new_location: int = Field(..., ge=0, le=1)
    failed_logins: int = Field(..., ge=0)
    files_downloaded: int = Field(..., ge=0)
    commands_executed: int = Field(..., ge=0)
    login_hour: int = Field(..., ge=0, le=23)
    weekend: int = Field(..., ge=0, le=1)

class PredictResponse(BaseModel):
    risk: str
    risk_score: int
    reasons: List[str]

# -----------------------------------------------
# Dashboard Schema
# -----------------------------------------------
class DashboardResponse(BaseModel):
    total_users: int
    total_logs: int
    high_risk: int
    medium_risk: int
    low_risk: int

# -----------------------------------------------
# Alert Schemas
# -----------------------------------------------
class AlertResponse(BaseModel):
    id: int
    user: str
    risk: str
    time: str
    status: str

    class Config:
        orm_mode = True
