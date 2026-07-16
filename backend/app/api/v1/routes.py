from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint to verify API readiness."""
    return {"status": "ok", "message": "SentinelAI backend is healthy."}
