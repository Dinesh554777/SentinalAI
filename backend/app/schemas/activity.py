from pydantic import BaseModel
from typing import Optional


class ActivityCreate(BaseModel):
    user_id: int
    action: str
    description: Optional[str]


class ActivityOut(BaseModel):
    id: int
    user_id: int
    action: str
    description: Optional[str]

    class Config:
        orm_mode = True
