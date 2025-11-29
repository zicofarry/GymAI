from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.exercise import Exercise
from app.models.schedule import Schedule, ScheduleItem
from app.models.log import UserLog
from app.schemas.user import UserProfileInput
from app.schemas.schedule import ScheduleResponse, ScheduleItemResponse
from app.services import csp_service, user_service, schedule_service

router = APIRouter()

# --- HELPER FUNCTION: DINAMIS & PERSONALIZED ---
def map_to_response(items, user: User):
    """
    Mengubah data database menjadi response JSON.
    Melakukan perhitungan dinamis berdasarkan PROFIL USER (Berat & Level).
    """
    response_items = []
    
    # Faktor Pengali Kalori (Asumsi base di DB untuk orang 70kg)
    # Jika user berat 140kg, kalori x2. Jika 35kg, kalori x0.5.
    weight_factor = (user.weight_kg or 70) / 70.0
    
    # Faktor Penambah Set berdasarkan Level
    # Beginner: +0, Intermediate: +1, Advanced: +2, Athlete: +3
    level_bonus_sets = {
        "Beginner": 0,
        "Intermediate": 1,
        "Advanced": 2,
        "Athlete": 3
    }.get(user.fitness_level.value if hasattr(user.fitness_level, 'value') else user.fitness_level, 0)

    for item in items:
        ex = item.exercise
        muscle_val = ex.muscle_group.value if hasattr(ex.muscle_group, 'value') else str(ex.muscle_group)
        
        # 1. Ambil Default dari Library
        base_sets = getattr(ex, 'default_sets', 3) or 3
        base_reps = getattr(ex, 'default_reps', '12') or '12'
        rest = getattr(ex, 'rest_seconds', 60) or 60
        base_calories = getattr(ex, 'calories_burn_estimate', 50) or 50
        
        # 2. Lakukan Personalisasi (Matematika Sederhana)
        # Hitung Sets Final
        final_sets = base_sets + level_bonus_sets
        
        # Hitung Kalori Final (Base * WeightFactor * Ratio Durasi)
        # Kita asumsikan base_calories itu untuk durasi default. 
        # Jika jadwal CSP memberi durasi lebih lama/pendek, kalori menyesuaikan.
        duration_ratio = item.duration_minutes / (ex.default_duration_minutes or 10)
        final_calories = int(base_calories * weight_factor * duration_ratio)

        response_items.append(ScheduleItemResponse(
            id=item.id,
            day=item.day_of_week.value if hasattr(item.day_of_week, 'value') else str(item.day_of_week),
            exercise_name=ex.name,
            time=str(item.scheduled_time),
            duration=item.duration_minutes,
            muscle_group=muscle_val,
            tips=item.ai_custom_tips or "Keep pushing!",
            is_completed=item.is_completed,
            
            # Data Personal
            sets=final_sets,
            reps=base_reps,     # Reps biasanya standar, tapi Sets yang main volume
            rest=rest,
            calories=final_calories # Kalori sudah disesuaikan berat badan
        ))
    return response_items

@router.post("/generate", response_model=ScheduleResponse)
def generate_schedule(
    user_input: UserProfileInput,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    # 1. Update Profil
    user_service.update_user_profile(db, current_user.id, user_input)

    # 2. Ambil Exercise
    exercises = db.query(Exercise).all()
    if not exercises: raise HTTPException(status_code=500, detail="Library kosong.")

    # 3. Hitung CSP
    try:
        generated_plan = csp_service.solve_csp_schedule(db, user_input, exercises)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Algoritma error: {str(e)}")
    
    if not generated_plan:
         raise HTTPException(status_code=400, detail="Gagal membuat jadwal.")

    # 4. Simpan ke DB
    motivation = f"Halo {current_user.username}, ayo semangat!"
    saved_schedule = schedule_service.save_generated_schedule(
        db, current_user.id, generated_plan, motivation
    )

    # 5. Return Response (Pass current_user ke fungsi mapping)
    return ScheduleResponse(
        motivation=motivation,
        schedule=map_to_response(saved_schedule.items, current_user) # <-- Passing User
    )

@router.get("/my-schedule", response_model=ScheduleResponse)
def get_my_schedule(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    schedule = db.query(Schedule).filter(
        Schedule.user_id == current_user.id,
        Schedule.is_active == True
    ).first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Belum ada jadwal aktif.")
    
    # Pass current_user ke fungsi mapping
    return ScheduleResponse(
        motivation=schedule.ai_weekly_motivation or "Welcome back!",
        schedule=map_to_response(schedule.items, current_user) # <-- Passing User
    )

@router.post("/items/{item_id}/toggle")
def toggle_item_status(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    item = db.query(ScheduleItem).filter(ScheduleItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    
    if item.schedule.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bukan jadwal milikmu")

    if item.is_completed:
        item.is_completed = False
        last_log = db.query(UserLog).filter(UserLog.schedule_item_id == item.id).order_by(UserLog.log_date.desc()).first()
        if last_log: db.delete(last_log)
        message = "Status dibatalkan."
    else:
        item.is_completed = True
        
        # Hitung kalori REAL (sesuai berat badan saat ini)
        weight_factor = (current_user.weight_kg or 70) / 70.0
        base_calories = getattr(item.exercise, 'calories_burn_estimate', 50) or 50
        duration_ratio = item.duration_minutes / (item.exercise.default_duration_minutes or 10)
        real_calories = int(base_calories * weight_factor * duration_ratio)

        new_log = UserLog(
            user_id=current_user.id,
            schedule_item_id=item.id,
            actual_duration_minutes=item.duration_minutes,
            calories_burned=real_calories, # <-- Simpan kalori yg akurat
            rating=5,
            feedback_text="Selesai via Checklist UI"
        )
        db.add(new_log)
        message = "Latihan selesai!"

    db.commit()
    return {"message": message, "is_completed": item.is_completed}