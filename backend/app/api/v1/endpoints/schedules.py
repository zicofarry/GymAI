from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.exercise import Exercise
from app.models.schedule import Schedule, ScheduleItem
from app.models.log import UserLog # Pastikan model ini sudah ada
from app.schemas.user import UserProfileInput
from app.schemas.schedule import ScheduleResponse, ScheduleItemResponse
from app.services import csp_service, user_service, schedule_service

router = APIRouter()

# --- HELPER FUNCTION ---
def map_to_response(items):
    response_items = []
    for item in items:
        # Handle exercise relation (bisa dari object atau dict tergantung asal data)
        ex = item.exercise
        muscle_val = ex.muscle_group.value if hasattr(ex.muscle_group, 'value') else str(ex.muscle_group)
        
        response_items.append(ScheduleItemResponse(
            id=item.id, # <-- ID Database
            day=item.day_of_week.value if hasattr(item.day_of_week, 'value') else str(item.day_of_week),
            exercise_name=ex.name,
            time=str(item.scheduled_time),
            duration=item.duration_minutes,
            muscle_group=muscle_val,
            tips=item.ai_custom_tips or "Keep pushing!",
            is_completed=item.is_completed # <-- Status Selesai
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

    # 5. Return Response (Ambil dari DB agar ID-nya ada)
    # Kita reload items dari saved_schedule agar dapat ID yang baru digenerate DB
    return ScheduleResponse(
        motivation=motivation,
        schedule=map_to_response(saved_schedule.items)
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
    
    return ScheduleResponse(
        motivation=schedule.ai_weekly_motivation or "Welcome back!",
        schedule=map_to_response(schedule.items)
    )

# --- ENDPOINT BARU: MARK AS DONE ---
@router.post("/items/{item_id}/toggle")
def toggle_item_status(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # 1. Cari Item
    item = db.query(ScheduleItem).filter(ScheduleItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    
    # 2. Validasi Pemilik
    if item.schedule.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bukan jadwal milikmu")

    # 3. Logika Toggle (Bolak-balik)
    if item.is_completed:
        # KASUS UNDO: Jika sudah selesai, batalkan.
        item.is_completed = False
        
        # Hapus log yang pernah dibuat (Clean up)
        last_log = db.query(UserLog).filter(
            UserLog.schedule_item_id == item.id
        ).order_by(UserLog.log_date.desc()).first()
        
        if last_log:
            db.delete(last_log)
            
        message = "Status dibatalkan (Undo)."
    else:
        # KASUS COMPLETE: Tandai selesai
        item.is_completed = True
        
        # Catat Log
        new_log = UserLog(
            user_id=current_user.id,
            schedule_item_id=item.id,
            actual_duration_minutes=item.duration_minutes,
            calories_burned=item.exercise.calories_burn_estimate or 50,
            rating=5,
            feedback_text="Selesai via Checklist UI"
        )
        db.add(new_log)
        message = "Latihan selesai!"

    db.commit()
    return {"message": message, "is_completed": item.is_completed}