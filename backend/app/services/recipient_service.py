from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.recipient_model import Recipient
from app.models.user_model import User
from app.schemas.recipient_schema import RecipientCreate, RecipientUpdate


def create_recipient(db: Session, current_user: User, payload: RecipientCreate):
    recipient = Recipient(
        user_id=current_user.id,
        nickname=payload.nickname,
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        country=payload.country,
        city=payload.city,
        payout_method=payload.payout_method,
        provider_preference=payload.provider_preference,
        mobile_money_network=payload.mobile_money_network,
        bank_name=payload.bank_name,
        bank_account_number=payload.bank_account_number,
        relationship_to_sender=payload.relationship_to_sender,
    )

    db.add(recipient)
    db.commit()
    db.refresh(recipient)
    return recipient


def list_recipients(db: Session, current_user: User):
    return (
        db.query(Recipient)
        .filter(Recipient.user_id == current_user.id)
        .order_by(Recipient.id.desc())
        .all()
    )


def get_recipient_or_404(db: Session, current_user: User, recipient_id: int):
    recipient = (
        db.query(Recipient)
        .filter(
            Recipient.id == recipient_id,
            Recipient.user_id == current_user.id,
        )
        .first()
    )

    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found.",
        )

    return recipient


def update_recipient(
    db: Session,
    current_user: User,
    recipient_id: int,
    payload: RecipientUpdate,
):
    recipient = get_recipient_or_404(db, current_user, recipient_id)

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(recipient, field, value)

    db.commit()
    db.refresh(recipient)
    return recipient


def delete_recipient(db: Session, current_user: User, recipient_id: int):
    recipient = get_recipient_or_404(db, current_user, recipient_id)

    db.delete(recipient)
    db.commit()

    return {"message": "Recipient deleted successfully."}