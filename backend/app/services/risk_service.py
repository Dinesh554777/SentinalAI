class RiskService:
    def assess_risk(self, name: str, severity: str, score: float) -> dict:
        return {"name": name, "severity": severity, "score": score}
