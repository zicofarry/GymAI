from fastapi import APIRouter
from app.api.v1.endpoints import auth, schedules, chatbot, users # <-- Tambah users

api_router = APIRouter()

api_router.include_router(auth.router, tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"]) # <-- Tambah ini
api_router.include_router(schedules.router, prefix="/schedules", tags=["Schedules"])
api_router.include_router(chatbot.router, prefix="/chat", tags=["AI Chatbot"])