from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.audit_log_model import AuditLog
from app.models.transfer_model import Transfer
from app.models.user_model import User
from app.services.audit_log_service import create_audit_log


def require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user


def list_audit_logs(db: Session, limit: int = 100):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .limit(limit)
        .all()
    )


def list_transfers_requiring_review(db: Session):
    return (
        db.query(Transfer)
        .filter(Transfer.compliance_review_status == "manual_review_required")
        .order_by(Transfer.id.desc())
        .all()
    )


def approve_transfer_review(
    db: Session,
    current_user: User,
    transfer_id: int,
    note: str | None = None,
):
    transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()

    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer not found.",
        )

    transfer.compliance_review_status = "approved"
    transfer.compliance_notes = note or "Approved by admin."

    db.commit()
    db.refresh(transfer)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="compliance_review_approved",
        entity_type="transfer",
        entity_id=transfer.id,
        details={
            "approved_by": current_user.email,
            "note": transfer.compliance_notes,
        },
    )

    return transfer


def reject_transfer_review(
    db: Session,
    current_user: User,
    transfer_id: int,
    note: str | None = None,
):
    transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()

    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer not found.",
        )

    transfer.compliance_review_status = "rejected"
    transfer.status = "cancelled"
    transfer.compliance_notes = note or "Rejected by admin."

    db.commit()
    db.refresh(transfer)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="compliance_review_rejected",
        entity_type="transfer",
        entity_id=transfer.id,
        details={
            "rejected_by": current_user.email,
            "note": transfer.compliance_notes,
        },
    )

    return transfer