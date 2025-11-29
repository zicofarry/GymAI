from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base # Import base untuk create tables
from app.db.session import engine
from app.api.v1.api import api_router

# Create Tables (Hanya untuk Development, Production pakai Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"/api/v1/openapi.json"
)

# Konfigurasi CORS (Agar frontend bisa akses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Ganti dengan URL frontend spesifik di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Utama
app.include_router(api_router, prefix="/api/v1")

# Root Check
@app.get("/")
def root():
    return {"message": "Welcome to GymAI API", "docs": "/docs"}