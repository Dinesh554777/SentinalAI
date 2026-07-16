from pydantic import BaseModel
from typing import Optional


class AuditCreate(BaseModel):
    entity: str
    entity_id: int
    action: str
    user_id: Optional[int]
    details: Optional[str]


class AuditOut(BaseModel):
    id: int
    entity: str
    entity_id: int
    action: str
    user_id: Optional[int]
    details: Optional[str]

    class Config:
        from_attributes = True
