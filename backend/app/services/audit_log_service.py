import json
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.models.audit_log_model import AuditLog


def create_audit_log(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=json.dumps(details or {}, default=str),
        ip_address=ip_address,
        user_agent=user_agent,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log