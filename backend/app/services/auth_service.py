from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest, RegisterRequest, UserUpdateRequest


def _clean_email(email: str) -> str:
    return email.strip().lower()


def _clean_optional(value):
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned or None


def _auth_response(user: User):
    access_token = create_access_token(subject=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


def register_user(db: Session, payload: RegisterRequest):
    email = _clean_email(payload.email)

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        first_name=_clean_optional(payload.first_name),
        last_name=_clean_optional(payload.last_name),
        phone_number=_clean_optional(payload.phone_number),
        province=_clean_optional(payload.province),
        country_of_residence="Canada",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return _auth_response(user)


def login_user(db: Session, payload: LoginRequest):
    email = _clean_email(payload.email)

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    return _auth_response(user)


def update_current_user(db: Session, current_user: User, payload: UserUpdateRequest):
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, _clean_optional(value))

    db.commit()
    db.refresh(current_user)

    return current_user