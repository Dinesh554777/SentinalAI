from pydantic import BaseModel
from typing import Optional


class AlertCreate(BaseModel):
    risk_id: int
    status: str
    severity: str
    message: Optional[str]


class AlertOut(BaseModel):
    id: int
    risk_id: int
    status: str
    severity: str
    message: Optional[str]

    class Config:
        orm_mode = True
