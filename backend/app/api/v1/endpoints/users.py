from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any
from datetime import datetime

from app.api import deps
from app.models.user import User
from app.models.log import UserLog
from app.models.schedule import ScheduleItem
from app.schemas.user import UserProfileResponse, UserProfileInput, UserStats, UserActivityLog
from app.services import user_service, schedule_service

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
def get_user_profile(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Mengambil data lengkap user beserta statistik tracker olahraga.
    """
    # 1. Hitung Statistik dari UserLog
    # Query Agregasi
    stats_query = db.query(
        func.count(UserLog.id).label("count"),
        func.sum(UserLog.actual_duration_minutes).label("duration"),
        func.sum(UserLog.calories_burned).label("calories")
    ).filter(UserLog.user_id == current_user.id).first()

    stats = UserStats(
        total_workouts=stats_query.count or 0,
        total_minutes=stats_query.duration or 0,
        total_calories=stats_query.calories or 0,
        streak_days=0 # Nanti bisa dikembangkan logic streak-nya
    )

    # 2. Ambil 5 Aktivitas Terakhir
    recent_logs = db.query(UserLog)\
        .filter(UserLog.user_id == current_user.id)\
        .order_by(UserLog.log_date.desc())\
        .limit(5).all()

    activity_list = []
    for log in recent_logs:
        # Ambil nama exercise dari relasi (agak deep)
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

    # 3. Mapping Enum ke String (Safety)
    return UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        weight=current_user.weight_kg or 0,
        height=current_user.height_cm or 0,
        fitness_level=current_user.fitness_level.value if hasattr(current_user.fitness_level, 'value') else str(current_user.fitness_level or "Beginner"),
        goal=current_user.main_goal.value if hasattr(current_user.main_goal, 'value') else str(current_user.main_goal or "Stay Healthy"),
        location=current_user.location_preference.value if hasattr(current_user.location_preference, 'value') else str(current_user.location_preference or "Home"),
        stats=stats,
        recent_activity=activity_list
    )

@router.put("/me", response_model=UserProfileResponse)
def update_user_profile_api(
    profile_in: UserProfileInput,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Update data profil user. 
    Otomatis mentrigger regenerate schedule jika data fisik berubah.
    """
    # Gunakan service yang sudah ada (reusable logic)
    updated_user = user_service.update_user_profile(db, current_user.id, profile_in)
    
    # Trigger regenerate schedule karena parameter fisik/goal berubah
    schedule_service.regenerate_schedule_from_db(db, updated_user)
    
    # Return data terbaru dengan memanggil fungsi get di atas (biar format sama)
    return get_user_profile(db, updated_user)