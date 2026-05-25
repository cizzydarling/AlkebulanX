# AlkebulanX

AlkebulanX is a full-stack remittance platform for Canada-to-Africa money transfer workflows. The application combines a React customer dashboard with a FastAPI backend for authentication, recipients, transfer quotes, transaction tracking, provider routing, admin review, webhooks, and subscription billing.

## Features

- User registration, login, JWT authentication, and profile management
- Recipient management for supported African corridors
- Transfer quotes, transfer creation, checkout handoff, cancellation, and status tracking
- Provider abstraction for Flutterwave, Paystack, and Orange Money integrations
- Stripe subscription billing for premium and business plans
- Admin review tools and audit log visibility
- Country and corridor metadata for supported transfer routes
- Local SQLite development database with configurable production database URL

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Framer Motion, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Payments | Stripe, Flutterwave-ready provider hooks |
| Database | SQLite for local development, configurable SQL database for production |

## Project Structure

```text
AlkebulanX/
  backend/
    app/
      core/          # Configuration, security, compliance, country metadata
      data/          # Database setup and sessions
      models/        # SQLAlchemy models
      routes/        # FastAPI route modules
      schemas/       # Pydantic request/response schemas
      services/      # Business logic and provider integrations
    requirements.txt
  frontend/
    public/
    src/
      api/           # Axios client and auth helpers
      components/    # Shared UI components
      data/          # Client-side country data
      pages/         # App routes and screens
      utils/         # Formatting and metadata helpers
```

## Getting Started

### Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- Git

### Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API should be available at:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

### Frontend Setup

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev -- --host 127.0.0.1
```

The web app should be available at `http://127.0.0.1:5173`.

## Environment Variables

Backend variables live in `backend/.env`. Start from `backend/.env.example`.

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | Display/API service name |
| `ENVIRONMENT` | Runtime environment, such as `development` or `production` |
| `DATABASE_URL` | SQLAlchemy database URL |
| `SECRET_KEY` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime |
| `FRONTEND_BASE_URL` | Frontend URL used for CORS and redirects |
| `FRONTEND_URL` | Optional deployed frontend URL |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave secret key |
| `FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Flutterwave webhook secret |
| `USE_LIVE_FLUTTERWAVE` | Enables live Flutterwave behavior when supported |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe price ID for premium plans |
| `STRIPE_BUSINESS_PRICE_ID` | Stripe price ID for business plans |

Frontend variables live in `frontend/.env`. Start from `frontend/.env.example`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for the FastAPI backend |

Only browser-safe frontend variables should be configured in Vercel, and Vite only exposes variables prefixed with `VITE_`. Keep `SECRET_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, Flutterwave secret keys, and AI/API secrets in the backend runtime only.

## API Overview

The backend exposes these route groups:

- `GET /health` - service health check
- `/auth` - registration, login, and current-user profile endpoints
- `/countries` - supported country metadata
- `/recipients` - recipient CRUD
- `/transfers` - quotes, creation, checkout, listing, status updates, and cancellation
- `/rates` - corridor and transfer preview endpoints
- `/billing` - Stripe checkout, portal, and webhook endpoints
- `/webhooks` - provider webhook endpoints
- `/admin` - admin review and audit endpoints

Interactive OpenAPI documentation is available locally at `http://127.0.0.1:8000/docs`.

## Useful Commands

Frontend:

```powershell
cd frontend
npm run dev
npm run lint
npm run build
npm run preview
```

Backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
python -m compileall -q app
```

## Security Notes

- Never commit `.env` files, local databases, virtual environments, or payment credentials.
- Rotate the default `SECRET_KEY` before any production deployment.
- Use test payment keys locally and configure provider webhooks per environment.
- Review CORS settings before deploying beyond local development.

## Deployment Notes

- Deploy the React/Vite frontend to Vercel.
- Deploy the FastAPI backend to Render.
- Use Supabase Postgres or another managed database for production persistence.
- Set `VITE_API_BASE_URL` in Vercel to the Render API URL, for example `https://your-render-api.onrender.com`.
- Keep backend secrets only in Render environment variables or local backend `.env` files.
- See `docs/DEPLOYMENT.md` for the production architecture, environment variable boundaries, and launch checklist.

## License

No license has been added yet. Add one before distributing or accepting external contributions.
