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
        user = UserModel(
            email=user_in.email,
            full_name=user_in.full_name,
            role=user_in.role,
            hashed_password=hashed,
            is_active=1,
        )
        return self.repo.create(user)

    def get_user(self, user_id: int) -> UserModel | None:
        return self.repo.get_by_id(user_id)

    def list_users(self) -> list[UserModel]:
        return self.repo.list_all()

    def update_user(self, user_id: int, user_in: UserCreate) -> UserModel | None:
        user = self.repo.get_by_id(user_id)
        if not user:
            return None
        user.email = user_in.email
        user.full_name = user_in.full_name
        user.role = user_in.role
        if user_in.password:
            user.hashed_password = get_password_hash(user_in.password)
        return self.repo.update(user)

    def delete_user(self, user_id: int) -> bool:
        user = self.repo.get_by_id(user_id)
        if not user:
            return False
        self.repo.delete(user)
        return True
