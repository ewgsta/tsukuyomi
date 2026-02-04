from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings
from app.services import scanner
from app.db.session import SessionLocal
import os

router = APIRouter()

class SettingsUpdate(BaseModel):
    music_directory: str | None = None

class SettingsResponse(BaseModel):
    music_directory: str
    project_name: str

@router.get("/", response_model=SettingsResponse)
async def get_settings():
    return SettingsResponse(
        music_directory=settings.MUSIC_DIRECTORY,
        project_name=settings.PROJECT_NAME
    )

@router.put("/")
async def update_settings(update: SettingsUpdate):
    if update.music_directory:
        if not os.path.exists(update.music_directory):
            return {"status": "error", "message": "Directory not found"}
        
        settings.MUSIC_DIRECTORY = update.music_directory
        
        # Rescan with new directory
        db = SessionLocal()
        try:
            result = scanner.scan_library(db, update.music_directory)
            return {"status": "success", "music_directory": update.music_directory, "scan_result": result}
        finally:
            db.close()
    
    return {"status": "success"}
