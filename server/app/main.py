from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.router import api_router
from app.services import watcher, scanner
from app.db.session import engine, Base, SessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    print("initial scan...")
    db = SessionLocal()
    try:
        scanner.scan_library(db)
    finally:
        db.close()
    
    watcher.start_watcher()
    
    yield
    
    watcher.stop_watcher()

app = FastAPI(title="tsukuyomi", lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "aptal çocuk.. burada ne arıyorsun ki? kaybolan yıllarını mı.. bende bulamadım umarım sen bulursun. ha ama eğer dökümantasyona göz atmak istersen /docs bakabilirsin!"}
