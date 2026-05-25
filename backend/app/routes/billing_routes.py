import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.data.db import get_db
from app.models.user_model import User
from app.routes.auth_routes import get_current_user

router = APIRouter(prefix="/billing", tags=["Billing"])

stripe.api_key = settings.STRIPE_SECRET_KEY


def _get_price_id(plan: str) -> str:
    if plan == "premium":
        return settings.STRIPE_PREMIUM_PRICE_ID

    if plan == "business":
        return settings.STRIPE_BUSINESS_PRICE_ID

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid subscription plan.",
    )


def _plan_from_price_id(price_id: str) -> str | None:
    if price_id == settings.STRIPE_PREMIUM_PRICE_ID:
        return "premium"

    if price_id == settings.STRIPE_BUSINESS_PRICE_ID:
        return "business"

    return None


@router.post("/create-checkout-session")
def create_checkout_session(
    plan: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Stripe is not configured.",
        )

    price_id = _get_price_id(plan)

    try:
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=" ".join(
                    part
                    for part in [current_user.first_name, current_user.last_name]
                    if part
                )
                or None,
                metadata={"user_id": str(current_user.id)},
            )

            current_user.stripe_customer_id = customer.id
            db.commit()
            db.refresh(current_user)

        session = stripe.checkout.Session.create(
            mode="subscription",
            customer=current_user.stripe_customer_id,
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{settings.FRONTEND_BASE_URL}/dashboard?billing=success",
            cancel_url=f"{settings.FRONTEND_BASE_URL}/pricing?billing=cancelled",
            metadata={
                "user_id": str(current_user.id),
                "plan": plan,
            },
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id),
                    "plan": plan,
                }
            },
        )

        return {"checkout_url": session.url}

    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/create-portal-session")
def create_portal_session(
    current_user: User = Depends(get_current_user),
):
    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No Stripe customer found for this account.",
        )

    try:
        session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url=f"{settings.FRONTEND_BASE_URL}/profile",
        )

        return {"portal_url": session.url}

    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        user_id = data.get("metadata", {}).get("user_id")
        plan = data.get("metadata", {}).get("plan")

        user = None

        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()

        if not user and customer_id:
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()

        if user:
            user.stripe_customer_id = customer_id
            user.stripe_subscription_id = subscription_id
            user.subscription_plan = plan
            user.subscription_status = "active"
            user.is_premium = plan in ["premium", "business"]
            db.commit()

    if event_type in [
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ]:
        subscription_id = data.get("id")
        customer_id = data.get("customer")
        status_value = data.get("status")

        user = db.query(User).filter(
            User.stripe_subscription_id == subscription_id
        ).first()

        if not user and customer_id:
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()

        if user:
            price_id = (
                data.get("items", {})
                .get("data", [{}])[0]
                .get("price", {})
                .get("id")
            )

            plan = _plan_from_price_id(price_id)

            user.subscription_status = status_value
            user.subscription_plan = plan
            user.is_premium = status_value in ["active", "trialing"] and plan in [
                "premium",
                "business",
            ]

            if event_type == "customer.subscription.deleted":
                user.is_premium = False
                user.subscription_status = "canceled"

            db.commit()

    return {"received": True}