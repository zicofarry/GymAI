from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.exercise import Exercise
from app.models.schedule import Schedule
from app.schemas.user import UserProfileInput
from app.schemas.schedule import ScheduleResponse, ScheduleItemResponse
from app.services import csp_service, user_service, schedule_service

router = APIRouter()

@router.post("/generate", response_model=ScheduleResponse)
def generate_schedule(
    user_input: UserProfileInput,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Generate jadwal latihan berbasis AI (CSP Algorithm).
    Akan otomatis update profil user dan menyimpan jadwal ke database.
    """
    
    # 1. Update Profil User & Busy Times (Service)
    updated_user = user_service.update_user_profile(db, current_user.id, user_input)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Ambil Data Exercise
    exercises = db.query(Exercise).all()
    if not exercises:
        raise HTTPException(status_code=500, detail="Exercise library is empty.")

    # 3. Jalankan Algoritma CSP (Service)
    try:
        generated_plan = csp_service.solve_csp_schedule(db, user_input, exercises)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Algorithm error: {str(e)}")
    
    if not generated_plan:
         raise HTTPException(status_code=400, detail="Could not generate schedule with current constraints.")

    # 4. Simpan Jadwal ke Database (Service)
    motivation = f"Halo {current_user.username}, Semangat untuk goal {current_user.main_goal}!"
    saved_schedule = schedule_service.save_generated_schedule(
        db, current_user.id, generated_plan, motivation
    )

    # 5. Format Response ke Frontend
    response_items = []
    for plan in generated_plan:
        ex = plan["exercise"]
        # Kita ambil nama enum value untuk ditampilkan ke JSON
        muscle_val = ex.muscle_group.value if hasattr(ex.muscle_group, 'value') else str(ex.muscle_group)
        
        response_items.append(ScheduleItemResponse(
            day=plan["day"],
            exercise_name=ex.name,
            time=str(plan["time"]),
            duration=plan["duration"],
            muscle_group=muscle_val,
            tips=f"Focus on form!" # Bisa diganti AI tips di tahap selanjutnya
        ))
        
    return ScheduleResponse(
        motivation=motivation,
        schedule=response_items
    )

@router.get("/my-schedule", response_model=ScheduleResponse)
def get_my_schedule(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Mengambil jadwal aktif milik user yang sedang login.
    """
    # 1. Cari jadwal yang is_active = True
    schedule = db.query(Schedule).filter(
        Schedule.user_id == current_user.id,
        Schedule.is_active == True
    ).first()
    
    if not schedule:
        # Jika belum punya jadwal, return 404
        raise HTTPException(status_code=404, detail="Kamu belum memiliki jadwal aktif. Silakan buat dulu.")
    
    # 2. Format data ke Schema Response
    response_items = []
    # Urutkan berdasarkan ID atau hari jika perlu
    for item in schedule.items:
        ex = item.exercise
        muscle_val = ex.muscle_group.value if hasattr(ex.muscle_group, 'value') else str(ex.muscle_group)
        
        response_items.append(ScheduleItemResponse(
            day=item.day_of_week, # Pastikan ini string enum
            exercise_name=ex.name,
            time=str(item.scheduled_time),
            duration=item.duration_minutes,
            muscle_group=muscle_val,
            tips=item.ai_custom_tips or "Keep pushing!"
        ))
        
    return ScheduleResponse(
        motivation=schedule.ai_weekly_motivation or "Welcome back!",
        schedule=response_items
    )