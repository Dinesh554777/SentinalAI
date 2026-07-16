class AlertService:
    def create_alert(self, risk_id: int, status: str, severity: str, message: str | None = None) -> dict:
        return {"risk_id": risk_id, "status": status, "severity": severity, "message": message}
