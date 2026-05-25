from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.data.db import get_db
from app.models.user_model import User
from app.routes.auth_routes import get_current_user
from app.schemas.recipient_schema import (
    RecipientCreate,
    RecipientResponse,
    RecipientUpdate,
)
from app.services.recipient_service import (
    create_recipient,
    delete_recipient,
    get_recipient_or_404,
    list_recipients,
    update_recipient,
)


router = APIRouter(prefix="/recipients", tags=["Recipients"])


@router.post("", response_model=RecipientResponse)
def create(
    payload: RecipientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_recipient(db, current_user, payload)


@router.get("", response_model=List[RecipientResponse])
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_recipients(db, current_user)


@router.get("/{recipient_id}", response_model=RecipientResponse)
def get_one(
    recipient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_recipient_or_404(db, current_user, recipient_id)


@router.patch("/{recipient_id}", response_model=RecipientResponse)
def update(
    recipient_id: int,
    payload: RecipientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_recipient(db, current_user, recipient_id, payload)


@router.delete("/{recipient_id}")
def delete(
    recipient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_recipient(db, current_user, recipient_id)