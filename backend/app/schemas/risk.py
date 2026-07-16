from pydantic import BaseModel
from typing import Optional


class RiskCreate(BaseModel):
    name: str
    severity: str
    score: float
    details: Optional[str]


class RiskOut(BaseModel):
    id: int
    name: str
    severity: str
    score: float
    details: Optional[str]

    class Config:
        orm_mode = True
