from pydantic import BaseModel
from typing import Optional


class PredictionRequest(BaseModel):
    user_id: int
    action: Optional[str] = "activity"
    description: Optional[str] = None
    new_device: int = 0
    new_location: int = 0
    failed_logins: int = 0
    files_downloaded: int = 0
    commands_executed: int = 0
    login_hour: int = 12
    weekend: bool = False


class PredictionOut(BaseModel):
    risk: str
    risk_score: float
    reasons: list[str]
