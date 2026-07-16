class AuditService:
    def log_audit(self, entity: str, entity_id: int, action: str, user_id: int | None = None, details: str | None = None) -> dict:
        return {
            "entity": entity,
            "entity_id": entity_id,
            "action": action,
            "user_id": user_id,
            "details": details,
        }
