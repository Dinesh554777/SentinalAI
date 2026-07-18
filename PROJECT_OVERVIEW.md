# SentinelAI — Project Overview

## What It Is
An AI-powered **Privileged Access Misuse Detection** system. It monitors user activity in real-time, classifies risk using a trained ML model, sends OTP email verification, and generates alerts/notifications.

---

## Tech Stack

| Layer       | Technology                                                |
|-------------|-----------------------------------------------------------|
| Frontend    | React 19 + TypeScript 6, Vite 8, Tailwind CSS 3.4, Radix UI (shadcn/ui), Framer Motion, Recharts |
| Backend     | Python, FastAPI, SQLAlchemy ORM, PostgreSQL                |
| ML Model    | scikit-learn RandomForestClassifier (8 features, 3 classes) |
| Auth        | JWT (access + refresh), bcrypt password hashing           |
| OTP/Email   | Gmail SMTP (smtp.gmail.com:587), Redis for OTP storage   |
| Real-time   | Background log generator (3-8s intervals), frontend polling (3s) |

---

## Directory Structure

```
SentinalAI/
├── backend/
│   ├── main.py                      # FastAPI app, lifespan (startup/shutdown), CORS, routers
│   ├── .env                         # DATABASE_URL, JWT keys, Redis config, SMTP config
│   ├── requirements.txt
│   │
│   ├── api/                         # Route handlers
│   │   ├── auth.py                  # POST /auth/login, /register, /logout, /me, /sessions
│   │   ├── auth_deps.py             # get_current_user, require_admin dependencies
│   │   ├── otp.py                   # POST /auth/signup, /send-otp, /verify-otp, /complete-signup
│   │   ├── predict.py               # POST /predict-risk (ML inference)
│   │   ├── logs.py                  # CRUD /logs, GET /logs/recent?since= (polling)
│   │   ├── notifications.py         # CRUD /notifications, /unread-count, /read-all
│   │   ├── alerts.py                # GET /alerts, POST /alerts/{id}/acknowledge
│   │   ├── dashboard.py             # GET /dashboard (stats aggregation)
│   │   ├── users.py                 # GET /users, GET /users/{id}
│   │   └── reports.py               # GET /reports, GET /reports/download (CSV)
│   │
│   ├── database/
│   │   ├── database.py              # SQLAlchemy engine + session factory
│   │   ├── models.py                # User, UserSession, ActivityLog, Alert, Notification
│   │   └── schemas.py               # Pydantic request/response models
│   │
│   ├── services/
│   │   ├── prediction_service.py    # ML inference: predict_proba, feature importances, reasons
│   │   ├── log_generator.py         # Background task: generates realistic logs every 3-8s
│   │   └── email_service.py         # SMTP email: send_otp_email, send_alert_email
│   │
│   ├── utils/
│   │   ├── security.py              # JWT create/verify, password hash/verify
│   │   └── redis_client.py          # Redis connection, OTP store/get/delete (120s TTL)
│   │
│   └── ml/
│       ├── train.py                 # Model training: 200 trees, 80/20 split, 98% accuracy
│       ├── dataset/
│       │   ├── generate_dataset.py  # Synthetic dataset generator (5000 rows)
│       │   └── privileged_access_dataset.csv
│       └── models/
│           ├── risk_model.pkl       # Trained RandomForestClassifier
│           └── encoder.pkl          # LabelEncoder (Low/Medium/High → 0/1/2)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Routes, lazy loading, Sonner + shadcn Toaster
│   │   ├── main.tsx                 # React entry, QueryClientProvider
│   │   ├── index.css                # Global styles, blue color scheme, glassmorphism utilities
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx        # Email + password, link to signup
│   │   │   │   ├── Signup.tsx       # Name, email, password, role selection
│   │   │   │   ├── OTP.tsx          # 6-digit code input, 2-min countdown, dev hint
│   │   │   │   └── AccessDenied.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.tsx    # Stats cards, charts, live feed
│   │   │   ├── live-monitoring/
│   │   │   │   └── LiveMonitoring.tsx  # Real-time events, 3s polling, pause/resume
│   │   │   ├── risk-analysis/
│   │   │   │   └── RiskAnalysis.tsx # AI explainability, radar chart, trends
│   │   │   ├── alerts/
│   │   │   │   └── Alerts.tsx       # Security alerts, acknowledge
│   │   │   ├── users/
│   │   │   │   ├── Users.tsx        # User directory with ML-based risk scores
│   │   │   │   └── UserDetails.tsx  # Individual user profile
│   │   │   ├── reports/
│   │   │   │   └── Reports.tsx      # Security reports, CSV download
│   │   │   ├── profile/
│   │   │   │   └── Profile.tsx      # User profile
│   │   │   └── settings/
│   │   │       └── Settings.tsx     # System settings
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AuthLayout.tsx   # Login/signup layout with animated background
│   │   │   │   ├── DashboardLayout.tsx  # Sidebar + Navbar + main content
│   │   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   │   ├── Navbar.tsx       # Top bar with notifications (10s polling)
│   │   │   │   └── ProtectedRoute.tsx  # JWT validation route guard
│   │   │   ├── dashboard/
│   │   │   │   ├── AIExplainabilityPanel.tsx  # Risk factors, reasons, confidence
│   │   │   │   ├── SecurityCommandCenter.tsx
│   │   │   │   ├── EnterpriseMetrics.tsx
│   │   │   │   ├── SecurityHealthPanel.tsx
│   │   │   │   └── ThreatIntelligencePanel.tsx
│   │   │   ├── shared/
│   │   │   │   ├── LiveActivityFeed.tsx   # Real-time event feed
│   │   │   │   ├── AttackTimeline.tsx     # Behavior timeline
│   │   │   │   ├── AttackSimulationFab.tsx # Attack simulator
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── ui/                  # shadcn/ui components (button, card, dialog, etc.)
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts               # Axios client: authApi, logsApi, predictionApi, etc.
│   │   │   └── mockApi.ts           # Central API aggregation (getRiskAnalysis, getActivities)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useApi.ts            # React Query hooks
│   │   │   └── use-toast.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   │
│   │   └── lib/
│   │       └── utils.ts             # cn() utility
│   │
│   ├── package.json
│   ├── vite.config.ts               # /api proxy → http://127.0.0.1:8000
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── .gitignore
```

---

## How It Works (Data Flow)

### 1. Background Log Generation (Automatic)
```
main.py lifespan → background_log_generator() → every 3-8 seconds:
  → Randomly picks user + action (login, download, command exec, etc.)
  → Calls prediction_service.predict_user_risk(features)
  → Saves ActivityLog with risk level + score to PostgreSQL
  → If high risk → creates Alert + Notification
```

### 2. ML Prediction Pipeline
```
Input: {new_device, new_location, failed_logins, files_downloaded,
        commands_executed, login_hour, weekend, session_duration}
        ↓
prediction_service.predict_user_risk()
        ↓
model.predict(df) → risk label (Low/Medium/High)
model.predict_proba(df) → class probabilities
        ↓
risk_score = High% × 95 + Medium% × 55 + Low% × 15
confidence = probability of predicted class
reasons = feature-importance weighted explanations
        ↓
Response: {risk, risk_score, confidence, reasons, feature_importance}
```

### 3. User Signup Flow
```
Signup page → POST /auth/signup (name, email, password, role)
  → Backend stores temp data in Redis, sends OTP via Gmail SMTP
  → OTP page → 6-digit code input (2-min countdown)
  → POST /auth/verify-otp → validates code from Redis
  → POST /auth/complete-signup → creates user in DB, returns JWT
  → Redirect to /dashboard
```

### 4. Frontend Polling
```
LiveMonitoring:  GET /logs/recent?since=<timestamp> → every 3 seconds
Navbar:          GET /notifications/unread-count → every 10 seconds
RiskAnalysis:    POST /predict-risk + GET /feature-importance (React Query cache)
Users:           GET /users → each user's latest log → predict-risk → real risk_score
```

---

## Login Credentials

| Role   | Email            | Password  |
|--------|------------------|-----------|
| Admin  | admin@bank.com   | admin123  |
| DBA    | john@bank.com    | password  |

---

## Running Locally

```bash
# Backend (terminal 1) — HTTPS on port 8443
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8443 --ssl-keyfile certs/key.pem --ssl-certfile certs/cert.pem

# Frontend (terminal 2) — HTTPS on port 5173
cd frontend
npm run dev   # → https://localhost:5173

# Redis (terminal 3) — only if OTP email needed
C:\Users\hp\Downloads\redis-server\redis-server.exe
```

> Browser will show a "Not Secure" warning for self-signed certs. Click Advanced → Proceed to localhost.

---

## TLS / HTTPS

Both frontend and backend serve over **HTTPS** with self-signed certificates.

| Component  | URL                          | Cert Location          |
|------------|------------------------------|------------------------|
| Backend    | `https://127.0.0.1:8443`     | `backend/certs/`       |
| Frontend   | `https://localhost:5173`      | `frontend/certs/`      |

- Certs are auto-generated on first run if missing (Python `cryptography` library)
- Valid for 365 days, covers `localhost` and `127.0.0.1`
- Vite proxies `/api` → `https://127.0.0.1:8443` with `secure: false` (self-signed)
- All data in transit is encrypted (JWT tokens, OTP codes, ML predictions, user data)
- `backend/certs/` and `frontend/certs/` are in `.gitignore` — never committed

---

## ML Model Details

- **Algorithm**: RandomForestClassifier (200 trees, max_depth=15)
- **Features**: 8 numeric inputs
  - `files_downloaded` (21.2%) — highest importance
  - `commands_executed` (17.2%)
  - `failed_logins` (14.7%)
  - `new_location` (13.4%)
  - `new_device` (12.0%)
  - `session_duration` (9.3%)
  - `login_hour` (6.6%)
  - `weekend_login` (5.6%)
- **Training**: 5000 synthetic rows, 80/20 split, 98% test accuracy
- **Output**: Risk label + probability-based score (0-100) + confidence + reasons

---

## Key API Endpoints

| Method | Endpoint                | Purpose                        |
|--------|-------------------------|--------------------------------|
| POST   | /auth/login             | JWT login                      |
| POST   | /auth/signup            | Start OTP signup               |
| POST   | /auth/verify-otp        | Verify 6-digit code            |
| POST   | /auth/complete-signup   | Create account + return JWT     |
| POST   | /predict-risk           | ML risk prediction             |
| GET    | /logs/recent?since=     | Poll new activity logs         |
| GET    | /notifications/unread-count | Badge count               |
| GET    | /feature-importance     | Model feature weights          |
| GET    | /dashboard              | Aggregated stats               |
| GET    | /reports/download       | CSV export                     |

---

## Environment Variables (.env)

```
DATABASE_URL=postgresql://postgres:Dinesh30112006@localhost:5432/sentinalai
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dinesh3212001@gmail.com
SMTP_PASSWORD=qkoeylevpujspjte
JWT_SECRET_KEY=<secret>
JWT_REFRESH_KEY=<secret>
```
