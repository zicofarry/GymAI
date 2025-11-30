from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, List
from datetime import datetime, timedelta

from app.api import deps
from app.models.user import User
from app.models.log import UserLog
from app.models.schedule import Schedule
from app.schemas.user import UserProfileResponse, UserProfileInput, UserStats, UserActivityLog
from app.services import user_service, schedule_service
from app.services.chat_service import chat_service 

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
async def get_user_profile(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Mengambil data lengkap user beserta statistik tracker olahraga.
    """
    # 1. Hitung Statistik dari UserLog
    stats_query = db.query(
        func.count(UserLog.id).label("count"),
        func.sum(UserLog.actual_duration_minutes).label("duration"),
        func.sum(UserLog.calories_burned).label("calories")
    ).filter(UserLog.user_id == current_user.id).first()

    stats = UserStats(
        total_workouts=stats_query.count or 0,
        total_minutes=stats_query.duration or 0,
        total_calories=stats_query.calories or 0,
        streak_days=0 
    )

    # 2. Ambil 5 Aktivitas Terakhir (Recent Activity)
    recent_logs = db.query(UserLog)\
        .filter(UserLog.user_id == current_user.id)\
        .order_by(UserLog.log_date.desc())\
        .limit(5).all()

    activity_list = []
    for log in recent_logs:
        ex_name = "Unknown Exercise"
        if log.schedule_item and log.schedule_item.exercise:
            ex_name = log.schedule_item.exercise.name
        
        activity_list.append(UserActivityLog(
            id=log.id,
            date=log.log_date.strftime("%Y-%m-%d %H:%M"),
            exercise_name=ex_name,
            duration=log.actual_duration_minutes or 0,
            calories=log.calories_burned or 0,
            rating=log.rating
        ))

    # --- FITUR 3: WEEKLY REPORT WRITER ---
    
    # Hitung tanggal 7 hari yang lalu
    cutoff_date = datetime.now() - timedelta(days=7)
    
    # Query log dengan filter tanggal Python
    weekly_logs = db.query(UserLog).filter(
        UserLog.user_id == current_user.id,
        UserLog.log_date >= cutoff_date
    ).order_by(UserLog.log_date.asc()).all()
    
    # Panggil AI (Async)
    ai_report = await chat_service.generate_weekly_report(current_user.username, weekly_logs)

    # 3. Mapping & Return
    def get_val(x): return x.value if hasattr(x, 'value') else str(x)

    return UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        weight=current_user.weight_kg or 0,
        height=current_user.height_cm or 0,
        fitness_level=get_val(current_user.fitness_level or "Beginner"),
        goal=get_val(current_user.main_goal or "Stay Healthy"),
        location=get_val(current_user.location_preference or "Home"),
        stats=stats,
        recent_activity=activity_list,
        weekly_report_text=ai_report
    )

@router.put("/me", response_model=UserProfileResponse)
async def update_user_profile_api(
    profile_in: UserProfileInput,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Update profil dan regenerate jadwal."""
    updated_user = user_service.update_user_profile(db, current_user.id, profile_in)
    
    # Regenerate Schedule (Async)
    await schedule_service.regenerate_schedule_from_db(db, updated_user)
    
    return await get_user_profile(db, updated_user)

@router.post("/analyze")
async def analyze_user_progress(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Fitur 4: Improvement Suggestions (On-Demand)"""
    logs = db.query(UserLog).filter(UserLog.user_id == current_user.id).all()
    
    schedule_items = []
    active_sched = db.query(Schedule).filter(Schedule.user_id == current_user.id, Schedule.is_active == True).first()
    if active_sched:
        schedule_items = active_sched.items

    suggestion = await chat_service.analyze_performance(current_user, logs, schedule_items)
    
    return {"suggestion": suggestion}

# ENDPOINT UNTUK LOG AKTIVITAS HARIAN
@router.get("/logs", response_model=List[UserActivityLog])
def get_user_logs_by_date(
    date_str: str, # Terima tanggal sebagai string YYYY-MM-DD
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> List[UserActivityLog]:
    """Mengambil semua log aktivitas untuk tanggal tertentu."""
    
    # 1. Validasi dan Konversi Tanggal
    try:
        # Coba konversi string ke objek date Python
        query_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Format tanggal tidak valid. Gunakan YYYY-MM-DD.")

    # 2. Query Log
    logs = db.query(UserLog)\
        .filter(UserLog.user_id == current_user.id)\
        .filter(func.date(UserLog.log_date) == query_date)\
        .order_by(UserLog.log_date.asc()).all()
    
    # 3. Mapping ke Response Schema
    activity_list = []
    for log in logs:
        ex_name = log.schedule_item.exercise.name if log.schedule_item and log.schedule_item.exercise else "Latihan Bebas"
        
        # Output waktu dalam format yang sama (YYYY-MM-DD HH:MM)
        activity_list.append(UserActivityLog(
            id=log.id,
            date=log.log_date.strftime("%Y-%m-%d %H:%M"),
            exercise_name=ex_name,
            duration=log.actual_duration_minutes or 0,
            calories=log.calories_burned or 0,
            rating=log.rating
        ))
        
    return activity_list