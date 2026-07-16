from sqlalchemy.orm import Session

from app.repositories.activity_repository import ActivityRepository
from app.schemas.activity import ActivityCreate
from app.db.models.activity import Activity as ActivityModel


class ActivityService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ActivityRepository(db)

    def create(self, payload: ActivityCreate) -> ActivityModel:
        model = ActivityModel(**payload.model_dump())
        return self.repo.create(model)

    def get(self, activity_id: int) -> ActivityModel | None:
        return self.repo.get_by_id(activity_id)

    def list(self) -> list[ActivityModel]:
        return self.repo.list_all()

    def list_by_user(self, user_id: int) -> list[ActivityModel]:
        return self.repo.list_by_user(user_id)
