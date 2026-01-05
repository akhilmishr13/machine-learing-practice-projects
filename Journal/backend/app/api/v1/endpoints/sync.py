"""
Sync Endpoints (Notion, Google Calendar, etc.)
"""
from fastapi import APIRouter

router = APIRouter()


@router.post("/notion")
async def sync_notion():
    """Sync with Notion"""
    # TODO: Implement Notion sync
    return {"message": "Endpoint not yet implemented"}


@router.post("/google-calendar")
async def sync_google_calendar():
    """Sync with Google Calendar"""
    # TODO: Implement Google Calendar sync
    return {"message": "Endpoint not yet implemented"}


@router.post("/apple-calendar")
async def sync_apple_calendar():
    """Sync with Apple Calendar"""
    # TODO: Implement Apple Calendar sync
    return {"message": "Endpoint not yet implemented"}


@router.get("/status")
async def get_sync_status():
    """Get sync status for all services"""
    # TODO: Implement sync status
    return {
        "notion": {"enabled": False, "last_sync": None},
        "google_calendar": {"enabled": False, "last_sync": None},
        "apple_calendar": {"enabled": False, "last_sync": None},
    }


