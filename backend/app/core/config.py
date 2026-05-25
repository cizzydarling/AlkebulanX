from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AlkebulanX"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "sqlite:///./alkebulanx.db"

    SECRET_KEY: str = "change-this-secret-key-before-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    FRONTEND_BASE_URL: str = "http://localhost:5173"
    FRONTEND_URL: str = ""

    # Flutterwave (existing)
    FLUTTERWAVE_SECRET_KEY: str = ""
    FLUTTERWAVE_PUBLIC_KEY: str = ""
    FLUTTERWAVE_WEBHOOK_SECRET: str = ""
    USE_LIVE_FLUTTERWAVE: bool = False

    # ✅ Stripe (NEW)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    STRIPE_PREMIUM_PRICE_ID: str = ""
    STRIPE_BUSINESS_PRICE_ID: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
