from pydantic import BaseModel, Field, EmailStr
from typing import Dict, List, Optional
import datetime


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str
    expires_in: int


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    role: str = "Standard"


class UserResponse(BaseModel):
    id: int
    name: str
    role: str

    model_config = {"from_attributes": True}


class UserDetailsResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: int
    last_login: Optional[datetime.datetime] = None
    created_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


class SessionResponse(BaseModel):
    id: int
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime.datetime
    expires_at: datetime.datetime

    model_config = {"from_attributes": True}


class LogCreate(BaseModel):
    user_id: int
    new_device: int = Field(..., ge=0, le=1)
    new_location: int = Field(..., ge=0, le=1)
    failed_logins: int = Field(..., ge=0)
    files_downloaded: int = Field(..., ge=0)
    commands_executed: int = Field(..., ge=0)
    login_hour: int = Field(..., ge=0, le=23)
    weekend: int = Field(..., ge=0, le=1)


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

    model_config = {"from_attributes": True}


class PredictRequest(BaseModel):
    new_device: int = Field(..., ge=0, le=1)
    new_location: int = Field(..., ge=0, le=1)
    failed_logins: int = Field(..., ge=0)
    files_downloaded: int = Field(..., ge=0)
    commands_executed: int = Field(..., ge=0)
    login_hour: int = Field(..., ge=0, le=23)
    weekend: int = Field(..., ge=0, le=1)
    session_duration: int = Field(default=30, ge=0)


class PredictResponse(BaseModel):
    risk: str
    risk_score: float
    confidence: float
    reasons: List[str]
    feature_importance: Dict[str, float]


class DashboardResponse(BaseModel):
    total_users: int
    total_logs: int
    high_risk: int
    medium_risk: int
    low_risk: int
    active_sessions: int = 0


class AlertResponse(BaseModel):
    id: int
    user: str
    risk: str
    time: str
    status: str

    model_config = {"from_attributes": True}
