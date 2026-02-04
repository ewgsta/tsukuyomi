
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tsukuyomi"
    API_V1_STR: str = "/api/v1"

    # müziklerin saklandıgı klasörün yolu.
    MUSIC_DIRECTORY: str = os.getenv("MUSIC_DIRECTORY", r"C:\Users\ewgst\Music\deemix Music")
    
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./tsukuyomi.db"

    class Config:
        env_file = ".env"

settings = Settings()
