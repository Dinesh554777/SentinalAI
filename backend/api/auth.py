from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from database import models, schemas
from utils import security

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
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


@router.post("/register")
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
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
