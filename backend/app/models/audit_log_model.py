from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.data.db import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)

    entity_type = Column(String(100), nullable=True)
    entity_id = Column(Integer, nullable=True)

    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)

    details = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())