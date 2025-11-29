from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.exercise import Exercise
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