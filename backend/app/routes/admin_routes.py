from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.data.db import get_db
from app.models.user_model import User
from app.routes.auth_routes import get_current_user
from app.schemas.admin_schema import AdminTransferDecision
from app.schemas.audit_log_schema import AuditLogResponse
from app.schemas.transfer_schema import TransferResponse
from app.services.admin_service import (
    approve_transfer_review,
    list_audit_logs,
    list_transfers_requiring_review,
    reject_transfer_review,
    require_admin,
)


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    return list_audit_logs(db, limit=limit)


@router.get("/transfers/review", response_model=List[TransferResponse])
def get_transfers_requiring_review(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    return list_transfers_requiring_review(db)


@router.post("/transfers/{transfer_id}/approve", response_model=TransferResponse)
def approve_transfer(
    transfer_id: int,
    payload: AdminTransferDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    return approve_transfer_review(
        db=db,
        current_user=current_user,
        transfer_id=transfer_id,
        note=payload.note,
    )


@router.post("/transfers/{transfer_id}/reject", response_model=TransferResponse)
def reject_transfer(
    transfer_id: int,
    payload: AdminTransferDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    return reject_transfer_review(
        db=db,
        current_user=current_user,
        transfer_id=transfer_id,
        note=payload.note,
    )