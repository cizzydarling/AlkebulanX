from typing import Optional

from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    user_id: Optional[int] = None
    action: str

    entity_type: Optional[str] = None
    entity_id: Optional[int] = None

    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    details: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: int

    user_id: Optional[int] = None
    action: str

    entity_type: Optional[str] = None
    entity_id: Optional[int] = None

    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    details: Optional[str] = None

    class Config:
        from_attributes = True