import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database.database import get_db
from database import models
from api.auth_deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class NotificationUpdate(BaseModel):
    is_read: bool


@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id)
        | (models.Notification.user_id.is_(None))
    )
    if unread_only:
        query = query.filter(models.Notification.is_read == 0)
    return query.order_by(models.Notification.created_at.desc()).limit(limit).all()


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    count = db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id)
        | (models.Notification.user_id.is_(None)),
        models.Notification.is_read == 0,
    ).count()
    return {"count": count}


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = 1
    db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id)
        | (models.Notification.user_id.is_(None)),
        models.Notification.is_read == 0,
    ).update({"is_read": 1})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}
