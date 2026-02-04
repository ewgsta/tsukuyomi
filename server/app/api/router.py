from fastapi import APIRouter
from app.api.endpoints import health, music, settings

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(music.router, prefix="/music", tags=["music"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
