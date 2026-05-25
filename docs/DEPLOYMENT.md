# AlkebulanX Deployment Guide

This project is designed to run as a split production stack:

| Component | Platform | Responsibility |
| --- | --- | --- |
| Frontend | Vercel | React/Vite UI, marketing pages, dashboards, onboarding |
| Backend API | Render | Auth, payments, database access, AI logic, private APIs, secrets |
| Database | Supabase | Managed Postgres |
| Auth | JWT, Clerk, or custom | User sessions and identity |
| Payments | Stripe | Subscriptions and billing |
| African payouts | Flutterwave | Regional payment and payout integrations |

## Frontend on Vercel

Only public browser-safe variables belong in Vercel's frontend environment.

Required:

```text
VITE_API_BASE_URL=https://your-render-api.onrender.com
```

Temporary Vercel proxy option:

```text
VITE_API_BASE_URL=https://alkebulan-x.vercel.app/_/backend
```

Safe frontend variables must start with `VITE_`.

Examples:

```text
VITE_API_BASE_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_FLUTTERWAVE_PUBLIC_KEY=
```

Do not put server secrets in Vercel frontend variables.

Never expose these to the browser:

```text
SECRET_KEY=
DATABASE_URL=
STRIPE_SECRET_KEY=
FLW_SECRET_KEY=
OPENAI_API_KEY=
```

## Backend on Render

Backend-only secrets belong in Render environment variables, server runtime settings, or a local `backend/.env` file.

Recommended Render service settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required backend variables:

```text
APP_NAME=AlkebulanX
ENVIRONMENT=production
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_BASE_URL=https://alkebulan-x.vercel.app
FRONTEND_URL=https://alkebulan-x.vercel.app
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_WEBHOOK_SECRET=
USE_LIVE_FLUTTERWAVE=true
```

## Supabase Database

Use Supabase Postgres for production persistence. Copy the SQLAlchemy-compatible connection string into Render as `DATABASE_URL`.

Keep local development on SQLite unless you need to test production database behavior.

## Recommended Launch Sequence

1. Deploy the frontend to Vercel.
2. Deploy the backend API to Render.
3. Create a Supabase Postgres database.
4. Add backend secrets to Render.
5. Set `VITE_API_BASE_URL` in Vercel to the Render API URL.
6. Redeploy the frontend after changing Vercel environment variables.
7. Smoke test `/health`, register/login, recipient creation, quote creation, and checkout flow.
