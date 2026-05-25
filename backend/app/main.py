from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.data.db import Base, engine
from app.models import audit_log_model, recipient_model, transfer_model, user_model
from app.routes import (
    auth_routes,
    rate_routes,
    country_routes,
    recipient_routes,
    transfer_routes,
    webhook_routes,
    admin_routes,
    billing_routes,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        description="AlkebulanX API - Canada to Africa remittance interface.",
    )

    # ✅ PRODUCTION-READY CORS
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Add deployed frontend automatically
    for frontend_url in (settings.FRONTEND_BASE_URL, settings.FRONTEND_URL):
        if frontend_url and frontend_url not in allowed_origins:
            allowed_origins.append(frontend_url)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ✅ SAFE DB INIT (avoid repeated create_all in prod workers)
    if settings.ENVIRONMENT != "production":
        Base.metadata.create_all(bind=engine)

    # ROUTES
    app.include_router(auth_routes.router)
    app.include_router(country_routes.router)
    app.include_router(recipient_routes.router)
    app.include_router(transfer_routes.router)
    app.include_router(webhook_routes.router)
    app.include_router(admin_routes.router)
    app.include_router(rate_routes.router)
    app.include_router(billing_routes.router)

    # ROOT
    @app.get("/")
    def root():
        return {
            "app": settings.APP_NAME,
            "status": "running",
            "environment": settings.ENVIRONMENT,
        }

    # HEALTH CHECK (used by Render)
    @app.get("/health")
    def health_check():
        return {
            "status": "ok",
            "service": settings.APP_NAME,
        }

    return app


app = create_app()
