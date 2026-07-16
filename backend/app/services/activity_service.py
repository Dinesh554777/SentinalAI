class ActivityService:
    def record_activity(self, user_id: int, action: str, description: str | None = None) -> dict:
        return {"user_id": user_id, "action": action, "description": description}
