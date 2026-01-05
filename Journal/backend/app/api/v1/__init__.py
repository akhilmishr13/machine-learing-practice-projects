"""
API v1 Router
"""
from fastapi import APIRouter
from app.api.v1.endpoints import journal, calendar, sync, habits, auth

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(journal.router, prefix="/journal", tags=["journal"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])

