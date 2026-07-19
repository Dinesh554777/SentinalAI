import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

client = None
if GROQ_API_KEY and GROQ_API_KEY != "your-groq-api-key-here":
    client = OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)


def is_configured() -> bool:
    return client is not None


def _call_openai(system_prompt: str, user_prompt: str, max_tokens: int = 1024) -> str:
    if not client:
        return ""
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[AI Service] Groq error: {e}")
        return ""


def generate_threat_analysis(features: dict, risk: str, risk_score: float, confidence: float, reasons: list) -> dict:
    system_prompt = """You are SentinelAI, an expert cybersecurity analyst for a banking security operations center.
Analyze the given user activity data and provide a detailed threat analysis report.

Respond in JSON format with these fields:
- "summary": A 2-3 sentence executive summary of the threat level
- "threat_type": The most likely threat category (e.g., "Insider Threat", "Account Compromise", "Data Exfiltration", "Privilege Abuse", "Normal Activity")
- "severity_explanation": Why this severity level was assigned
- "recommended_actions": Array of 3-5 specific actions the SOC team should take
- "iocs": Array of 2-3 indicators of compromise observed in the data
- "impact_assessment": Brief description of potential business impact

Be specific, use cybersecurity terminology, and reference the actual data values."""

    features_text = json.dumps(features, indent=2)
    reasons_text = ", ".join(reasons)

    user_prompt = f"""Analyze this privileged user activity for potential insider threat:

**ML Model Prediction:**
- Risk Level: {risk}
- Risk Score: {risk_score}/100
- Confidence: {round(confidence * 100, 1)}%

**Activity Features:**
{features_text}

**ML Model Reasons:**
{reasons_text}

Provide your threat analysis in JSON format."""

    response = _call_openai(system_prompt, user_prompt, max_tokens=1024)
    if not response:
        return _fallback_threat_analysis(features, risk, risk_score, reasons)

    try:
        json_start = response.find("{")
        json_end = response.rfind("}") + 1
        if json_start != -1 and json_end > json_start:
            return json.loads(response[json_start:json_end])
    except json.JSONDecodeError:
        pass

    return {
        "summary": response[:500] if response else "AI analysis unavailable. Using rule-based assessment.",
        "threat_type": _infer_threat_type(features),
        "severity_explanation": f"Risk score of {risk_score}/100 with {risk} classification.",
        "recommended_actions": _fallback_actions(risk),
        "iocs": _infer_iocs(features),
        "impact_assessment": "Requires manual assessment." if risk == "Low" else "Potential data loss or unauthorized access. Immediate review recommended.",
    }


def generate_log_analysis(logs: list) -> dict:
    system_prompt = """You are SentinelAI, an expert cybersecurity analyst. Analyze the following activity logs 
and identify patterns, anomalies, and potential threats.

Respond in JSON format with:
- "overall_assessment": 2-3 sentence summary of the log pattern analysis
- "patterns_detected": Array of identified behavioral patterns
- "anomalies": Array of anomalous activities with explanation
- "threat_level": "Low", "Medium", or "High"
- "recommended_investigation": Array of specific investigation steps
- "timeline_summary": Brief chronological summary of key events"""

    logs_text = ""
    for i, log in enumerate(logs[:20], 1):
        logs_text += f"\nLog {i}:\n"
        for k, v in log.items():
            logs_text += f"  {k}: {v}\n"

    user_prompt = f"""Analyze these {len(logs)} activity logs for security threats:

{logs_text}

Provide your analysis in JSON format."""

    response = _call_openai(system_prompt, user_prompt, max_tokens=1500)
    if not response:
        return _fallback_log_analysis(logs)

    try:
        json_start = response.find("{")
        json_end = response.rfind("}") + 1
        if json_start != -1 and json_end > json_start:
            return json.loads(response[json_start:json_end])
    except json.JSONDecodeError:
        pass

    return {
        "overall_assessment": response[:500] if response else "Analysis unavailable.",
        "patterns_detected": [],
        "anomalies": [],
        "threat_level": "Medium",
        "recommended_investigation": ["Review recent high-risk logs", "Check for unusual access times"],
        "timeline_summary": "Manual review required.",
    }


def generate_security_summary(dashboard_stats: dict, recent_alerts: list, recent_logs: list) -> dict:
    system_prompt = """You are SentinelAI, a banking SOC AI assistant. Generate a comprehensive security summary 
for the security operations center dashboard.

Respond in JSON format with:
- "executive_summary": 3-4 sentence high-level summary suitable for CISO briefing
- "key_findings": Array of 3-5 key findings from the data
- "trends": Array of 2-3 observed trends
- "priority_actions": Array of 3-4 prioritized actions for the SOC team
- "risk_outlook": Brief assessment of upcoming risk posture

Be professional, use banking security terminology, and focus on actionable intelligence."""

    stats_text = json.dumps(dashboard_stats, indent=2)
    alerts_text = json.dumps(recent_alerts[:10], indent=2, default=str)
    logs_summary = json.dumps(recent_logs[:10], indent=2, default=str)

    user_prompt = f"""Generate the daily security summary for SentinelAI:

**Dashboard Statistics:**
{stats_text}

**Recent Alerts:**
{alerts_text}

**Recent Activity Logs:**
{logs_summary}

Provide your security summary in JSON format."""

    response = _call_openai(system_prompt, user_prompt, max_tokens=1024)
    if not response:
        return _fallback_summary(dashboard_stats, recent_alerts)

    try:
        json_start = response.find("{")
        json_end = response.rfind("}") + 1
        if json_start != -1 and json_end > json_start:
            return json.loads(response[json_start:json_end])
    except json.JSONDecodeError:
        pass

    return {
        "executive_summary": response[:500] if response else "Summary generation requires Groq API key.",
        "key_findings": [],
        "trends": [],
        "priority_actions": [],
        "risk_outlook": "Unable to generate outlook.",
    }


def generate_alert_narrative(user_name: str, action: str, features: dict, risk: str, risk_score: float) -> str:
    system_prompt = """You are SentinelAI. Generate a concise, professional security alert narrative 
for a SOC analyst. Write 2-3 sentences explaining what happened and why it matters.
Use active voice, be specific about the suspicious indicators, and suggest immediate next step."""

    user_prompt = f"""User: {user_name}
Action: {action}
Risk: {risk} (score: {risk_score}/100)
Features: {json.dumps(features)}

Write a security alert narrative."""

    response = _call_openai(system_prompt, user_prompt, max_tokens=256)
    if not response:
        return f"{user_name} triggered a {risk.lower()}-risk event ({action}, score: {risk_score}). Review recommended."

    return response


def generate_notification_message(user_name: str, risk: str, risk_score: float, features: dict) -> str:
    system_prompt = """You are SentinelAI. Generate a brief, clear notification message for a security alert.
Keep it under 2 sentences. State what happened and the urgency level."""

    user_prompt = f"""User: {user_name}
Risk Level: {risk}
Score: {risk_score}/100
Activity: {json.dumps(features)}

Generate a notification message."""

    response = _call_openai(system_prompt, user_prompt, max_tokens=128)
    if not response:
        return f"{user_name} triggered a {risk.lower()}-risk event (score: {risk_score}). Immediate review recommended."

    return response


def _infer_threat_type(features: dict) -> str:
    if features.get("files_downloaded", 0) > 500:
        return "Data Exfiltration"
    if features.get("failed_logins", 0) >= 3 and features.get("new_device"):
        return "Account Compromise"
    if features.get("commands_executed", 0) > 20:
        return "Privilege Abuse"
    if features.get("new_device") and features.get("new_location"):
        return "Insider Threat"
    return "Normal Activity"


def _infer_iocs(features: dict) -> list:
    iocs = []
    if features.get("new_device"):
        iocs.append("New/unrecognized device detected")
    if features.get("new_location"):
        iocs.append("Unfamiliar login location")
    if features.get("failed_logins", 0) >= 3:
        iocs.append(f"Brute force attempt ({features['failed_logins']} failures)")
    if features.get("files_downloaded", 0) > 500:
        iocs.append(f"Abnormal data transfer ({features['files_downloaded']} files)")
    return iocs[:3] if iocs else ["No specific IOCs identified"]


def _fallback_actions(risk: str) -> list:
    if risk == "High":
        return [
            "Immediately investigate the user session",
            "Review all recent file access and downloads",
            "Check for lateral movement indicators",
            "Notify the incident response team",
            "Consider temporary access suspension",
        ]
    elif risk == "Medium":
        return [
            "Monitor user activity closely",
            "Review login patterns for anomalies",
            "Verify user identity through secondary channel",
        ]
    return ["Continue standard monitoring", "Log for periodic review"]


def _fallback_threat_analysis(features: dict, risk: str, risk_score: float, reasons: list) -> dict:
    threat_type = _infer_threat_type(features)
    return {
        "summary": f"ML model classified this activity as {risk} risk (score: {risk_score}/100). {', '.join(reasons[:2])}.",
        "threat_type": threat_type,
        "severity_explanation": f"Risk score {risk_score}/100 based on behavioral analysis of {len(reasons)} indicators.",
        "recommended_actions": _fallback_actions(risk),
        "iocs": _infer_iocs(features),
        "impact_assessment": "Minimal impact expected." if risk == "Low" else "Potential security incident requiring investigation.",
    }


def _fallback_log_analysis(logs: list) -> dict:
    high_count = sum(1 for l in logs if l.get("risk") == "High")
    med_count = sum(1 for l in logs if l.get("risk") == "Medium")

    if high_count > len(logs) * 0.3:
        threat_level = "High"
    elif high_count > 0 or med_count > len(logs) * 0.3:
        threat_level = "Medium"
    else:
        threat_level = "Low"

    return {
        "overall_assessment": f"Analyzed {len(logs)} logs. {high_count} high-risk, {med_count} medium-risk events detected.",
        "patterns_detected": ["Behavioral pattern analysis requires Groq API key for detailed insights."],
        "anomalies": [f"{high_count} high-risk events detected"] if high_count > 0 else [],
        "threat_level": threat_level,
        "recommended_investigation": [
            "Review high-risk events in detail",
            "Check for user behavior deviations",
            "Verify access patterns against baseline",
        ],
        "timeline_summary": f"Activity spans recent period with {len(logs)} total events.",
    }


def _fallback_summary(stats: dict, alerts: list) -> dict:
    high = stats.get("high_risk", 0)
    total = stats.get("total_logs", 0)

    return {
        "executive_summary": f"SentinelAI monitoring active. {stats.get('total_users', 0)} users under surveillance across {total} logged events. {high} high-risk events require immediate attention.",
        "key_findings": [
            f"{high} high-risk events detected" if high > 0 else "No high-risk events detected",
            f"{stats.get('medium_risk', 0)} medium-risk events in review period",
            f"{stats.get('active_sessions', 0)} active user sessions",
        ],
        "trends": ["Detailed trend analysis requires Groq API key configuration."],
        "priority_actions": [
            "Investigate high-risk alerts" if high > 0 else "Continue standard monitoring",
            "Review user access patterns",
            "Update threat detection rules",
        ],
        "risk_outlook": "Elevated" if high > 5 else "Normal" if high == 0 else "Moderate",
    }
