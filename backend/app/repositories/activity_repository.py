from sqlalchemy.orm import Session

from app.db.models.activity import Activity


class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, activity_id: int) -> Activity | None:
        return self.db.query(Activity).filter(Activity.id == activity_id).first()

    def create(self, activity: Activity) -> Activity:
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity
