import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text

from database.database import engine, Base, SessionLocal
from database import models
from utils import security
from services import prediction_service

from api import auth, users, logs, predict, dashboard, alerts, reports, otp


def cleanup_expired_sessions():
    db = SessionLocal()
    try:
        expired = db.query(models.UserSession).filter(
            models.UserSession.expires_at < datetime.datetime.utcnow(),
            models.UserSession.is_revoked == 0,
        ).update({"is_revoked": 1})
        if expired:
            print(f"[Session Cleanup] Revoked {expired} expired sessions")
        db.commit()
    except Exception as e:
        print(f"[Session Cleanup] Warning: {e}")
    finally:
        db.close()


def seed_default_data():
    db = SessionLocal()
    try:
        admin_exists = db.query(models.User).filter(models.User.email == "admin@bank.com").first()
        if not admin_exists:
            admin_user = models.User(
                name="Administrator",
                email="admin@bank.com",
                password_hash=security.get_password_hash("admin123"),
                role="Admin",
            )
            db.add(admin_user)

            john_user = models.User(
                name="John",
                email="john@bank.com",
                password_hash=security.get_password_hash("password"),
                role="DBA",
            )
            db.add(john_user)
            db.commit()

            db.refresh(john_user)

            sample_log_low = models.ActivityLog(
                user_id=john_user.id,
                login_hour=10,
                new_device=0,
                new_location=0,
                failed_logins=0,
                files_downloaded=15,
                commands_executed=5,
                session_duration=25,
                weekend_login=0,
                risk="Low",
                risk_score=25,
            )
            db.add(sample_log_low)

            sample_log_high = models.ActivityLog(
                user_id=john_user.id,
                login_hour=2,
                new_device=1,
                new_location=1,
                failed_logins=5,
                files_downloaded=1200,
                commands_executed=45,
                session_duration=200,
                weekend_login=1,
                risk="High",
                risk_score=92,
            )
            db.add(sample_log_high)
            db.commit()

            db.refresh(sample_log_high)
            alert = models.Alert(
                user_id=john_user.id,
                risk="High",
                status="Active",
            )
            db.add(alert)
            db.commit()

            print("[Startup] Default data seeded successfully")
    except Exception as e:
        print(f"[Startup] Seeding warning: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[Startup] Database tables ready (PostgreSQL)")

    seed_default_data()
    cleanup_expired_sessions()
    print("[Startup] SentinelAI API is ready")

    yield

    print("[Shutdown] Cleaning up...")
    engine.dispose()


app = FastAPI(
    title="SentinelAI Security API",
    description="AI-Powered Privileged Access Misuse Detection API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(logs.router)
app.include_router(predict.router)
app.include_router(dashboard.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(otp.router)


@app.get("/feature-importance", tags=["System"])
def get_feature_importance():
    return prediction_service.get_feature_importances()


@app.get("/health", tags=["System"])
def health():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    finally:
        db.close()

    return {
        "status": "Running",
        "database": "PostgreSQL",
        "db_status": db_status,
        "version": "2.0.0",
    }
