import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database.database import engine, Base, get_db
from database import models
from utils import security
from services import prediction_service

# Import modular api routers
from api import auth, users, logs, predict, dashboard, alerts, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SentinelAI Security API",
    description="AI-Powered Privileged Access Misuse Detection API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(logs.router)
app.include_router(predict.router)
app.include_router(dashboard.router)
app.include_router(alerts.router)
app.include_router(reports.router)

# Seed default data on startup
@app.on_event("startup")
def startup_populate():
    db = next(get_db())
    try:
        # Check if users already exist
        admin_exists = db.query(models.User).filter(models.User.email == "admin@bank.com").first()
        if not admin_exists:
            # Seed Admin
            admin_user = models.User(
                name="Administrator",
                email="admin@bank.com",
                password_hash=security.get_password_hash("admin123"),
                role="Admin"
            )
            db.add(admin_user)
            
            # Seed John
            john_user = models.User(
                name="John",
                email="john@bank.com",
                password_hash=security.get_password_hash("password"),
                role="DBA"
            )
            db.add(john_user)
            db.commit()
            
            # Seed some initial activity logs & alerts
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
                risk_score=25
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
                risk_score=92
            )
            db.add(sample_log_high)
            db.commit()

            # Seed a default high-risk alert
            db.refresh(sample_log_high)
            alert = models.Alert(
                user_id=john_user.id,
                risk="High",
                status="Active"
            )
            db.add(alert)
            db.commit()
    except Exception as e:
        print(f"Startup seeding warning: {e}")
    finally:
        db.close()


# -----------------------------------------------
# Core Base Routes
# -----------------------------------------------

@app.get("/feature-importance", tags=["System"])
def get_feature_importance():
    return prediction_service.get_feature_importances()


@app.get("/health", tags=["System"])
def health():
    return {"status": "Running"}
