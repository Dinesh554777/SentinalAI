import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database.database import engine, Base, get_db
from database import models, schemas
from utils import security
from services import prediction_service

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
# 1. Authentication
# -----------------------------------------------

@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    # Support both username as email or direct match
    user = db.query(models.User).filter(
        (models.User.email == payload.username) | 
        (models.User.email == f"{payload.username}@bank.com") |
        (models.User.name.icontains(payload.username))
    ).first()
    
    if not user or not security.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
        
    token = security.create_access_token(subject=user.email, role=user.role)
    return {"access_token": token, "role": user.role}


@app.post("/auth/register")
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    exists = db.query(models.User).filter(models.User.email == payload.email).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already registered"
        )
        
    hashed_password = security.get_password_hash(payload.password)
    new_user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed_password,
        role=payload.role
    )
    db.add(new_user)
    db.commit()
    return {"message": "User Registered Successfully"}


# -----------------------------------------------
# 2. User Management
# -----------------------------------------------

@app.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    # Serialize to match the requested output
    return [{"id": u.id, "name": u.name, "role": u.role} for u in users]


@app.get("/users/{id}", response_model=schemas.UserDetailsResponse)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/{id}")
def update_user(id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email
    if payload.role is not None:
        user.role = payload.role
        
    db.commit()
    return {"message": "User updated successfully"}


@app.delete("/users/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


# -----------------------------------------------
# 3. Activity Logs
# -----------------------------------------------

@app.post("/logs")
def store_log(payload: schemas.LogCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Run predictions automatically
    features = payload.dict()
    risk, risk_score, reasons = prediction_service.predict_user_risk(features)

    # Store activity log
    # Assume default session duration of 60 if not supplied
    new_log = models.ActivityLog(
        user_id=payload.user_id,
        login_hour=payload.login_hour,
        new_device=payload.new_device,
        new_location=payload.new_location,
        failed_logins=payload.failed_logins,
        files_downloaded=payload.files_downloaded,
        commands_executed=payload.commands_executed,
        session_duration=60,  # Default fallback
        weekend_login=payload.weekend,
        risk=risk,
        risk_score=risk_score
    )
    db.add(new_log)
    db.commit()

    # Trigger alert if High Risk
    if risk == "High":
        new_alert = models.Alert(
            user_id=payload.user_id,
            risk=risk,
            status="Active"
        )
        db.add(new_alert)
        db.commit()

    return {"message": "Log Stored"}


@app.get("/logs", response_model=List[schemas.LogResponse])
def get_logs(db: Session = Depends(get_db)):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).all()


@app.get("/logs/{user_id}", response_model=List[schemas.LogResponse])
def get_user_logs(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.ActivityLog).filter(models.ActivityLog.user_id == user_id).all()


# -----------------------------------------------
# 4. AI Prediction
# -----------------------------------------------

@app.post("/predict-risk", response_model=schemas.PredictResponse)
def predict_risk(payload: schemas.PredictRequest):
    features = payload.dict()
    risk, risk_score, reasons = prediction_service.predict_user_risk(features)
    return {
        "risk": risk,
        "risk_score": risk_score,
        "reasons": reasons
    }


# -----------------------------------------------
# 5. Dashboard
# -----------------------------------------------

@app.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_logs = db.query(models.ActivityLog).count()
    
    high_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "High").count()
    medium_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Medium").count()
    low_risk = db.query(models.ActivityLog).filter(models.ActivityLog.risk == "Low").count()

    return {
        "total_users": total_users,
        "total_logs": total_logs,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk
    }


# -----------------------------------------------
# 6. Alerts
# -----------------------------------------------

@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.Alert).order_by(models.Alert.timestamp.desc()).all()
    response = []
    for alert in alerts:
        # Format time as 'YYYY-MM-DD HH:MM'
        formatted_time = alert.timestamp.strftime("%Y-%m-%d %H:%M")
        response.append({
            "id": alert.id,
            "user": alert.user.name,
            "risk": alert.risk,
            "time": formatted_time,
            "status": alert.status
        })
    return response


@app.post("/alerts/{id}/acknowledge")
def acknowledge_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "Acknowledged"
    db.commit()
    return {"message": "Alert Acknowledged"}


# -----------------------------------------------
# 7. Reports
# -----------------------------------------------

@app.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    # Summary report content as JSON representation
    logs = db.query(models.ActivityLog).all()
    alerts = db.query(models.Alert).all()
    return {
        "generated_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "total_logs": len(logs),
            "total_alerts": len(alerts),
            "high_risk_logs": sum(1 for l in logs if l.risk == "High")
        }
    }


@app.get("/reports/download")
def download_report(db: Session = Depends(get_db)):
    # Returns a CSV formatted log dump
    logs = db.query(models.ActivityLog).all()
    csv_content = "ID,User ID,Risk,Score,Device,Location,Failed Logins,Downloads,Commands,Hour,Weekend\n"
    for log in logs:
        csv_content += f"{log.id},{log.user_id},{log.risk},{log.risk_score},{log.new_device},{log.new_location},{log.failed_logins},{log.files_downloaded},{log.commands_executed},{log.login_hour},{log.weekend_login}\n"
    
    from fastapi.responses import Response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinal_report.csv"}
    )


# -----------------------------------------------
# 8. Feature Importance
# -----------------------------------------------

@app.get("/feature-importance")
def get_feature_importance():
    return prediction_service.get_feature_importances()


# -----------------------------------------------
# 9. Health Check
# -----------------------------------------------

@app.get("/health")
def health():
    return {"status": "Running"}
