from fastapi import APIRouter
from app.api.v1.endpoints import auth, schedules
# Nanti kita import chatbot di sini juga

api_router = APIRouter()

# Daftarkan endpoint Auth (Login/Register) di root level v1 (misal /api/v1/login)
api_router.include_router(auth.router, tags=["Authentication"])

# Daftarkan endpoint Schedules di /schedules (misal /api/v1/schedules/generate)
api_router.include_router(schedules.router, prefix="/schedules", tags=["Schedules"])
