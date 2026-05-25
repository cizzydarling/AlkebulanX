from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.data.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone_number = Column(String(50), nullable=True)

    country_of_residence = Column(String(100), default="Canada")
    province = Column(String(100), nullable=True)

    role = Column(String(50), default="user")  # user, admin

    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    kyc_status = Column(String(50), default="not_started")
    compliance_status = Column(String(50), default="clear")

    # Subscription / monetization
    is_premium = Column(Boolean, default=False)
    subscription_plan = Column(String(50), nullable=True)  # premium, business
    subscription_status = Column(String(50), nullable=True)  # active, trialing, canceled, past_due

    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())