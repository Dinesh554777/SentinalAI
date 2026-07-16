from app.db.models.user import User


class UserService:
    def get_user(self, username: str) -> dict | None:
        return {"username": username}

    def create_user(self, user_data: dict) -> dict:
        return user_data
