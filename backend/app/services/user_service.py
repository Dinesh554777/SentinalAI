from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.db.models.user import User as UserModel
from app.core.password import get_password_hash


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def create_user(self, user_in: UserCreate) -> UserModel:
        hashed = get_password_hash(user_in.password)
        user = UserModel(email=user_in.email, full_name=user_in.full_name, hashed_password=hashed, is_active=1)
        return self.repo.create(user)

    def get_user(self, user_id: int) -> UserModel | None:
        return self.repo.get_by_id(user_id)
from app.db.models.user import User


class UserService:
    def get_user(self, username: str) -> dict | None:
        return {"username": username}

    def create_user(self, user_data: dict) -> dict:
        return user_data
