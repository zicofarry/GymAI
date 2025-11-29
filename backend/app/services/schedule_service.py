from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.schedule import Schedule, ScheduleItem
from app.models.user import User
from app.models.exercise import Exercise
from app.services import csp_service
from app.schemas.user import UserProfileInput, BusyTimeInput

def save_generated_schedule(db: Session, user_id: int, generated_plan: list, motivation_text: str):
    """
    Menyimpan hasil algoritma CSP ke dalam tabel schedules dan schedule_items.
    """
    # 1. Set Tanggal (Misal: Mulai besok sampai 7 hari ke depan)
    start_date = date.today() + timedelta(days=1)
    end_date = start_date + timedelta(days=6)
    
    # 2. Non-aktifkan jadwal lama user ini (jika ada)
    existing_schedules = db.query(Schedule).filter(
        Schedule.user_id == user_id, 
        Schedule.is_active == True
    ).all()
    
    for sch in existing_schedules:
        sch.is_active = False
    
    # 3. Buat Header Schedule Baru
    new_schedule = Schedule(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
        ai_weekly_motivation=motivation_text
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule) # Agar kita dapat ID schedule yang baru dibuat
    
    # 4. Simpan Detail Item (Looping hasil CSP)
    schedule_items = []
    for plan in generated_plan:
        ex = plan["exercise"]
        
        item = ScheduleItem(
            schedule_id=new_schedule.id,
            exercise_id=ex.id,
            day_of_week=plan["day"],
            scheduled_time=plan["time"],
            duration_minutes=plan["duration"],
            is_completed=False,
            ai_custom_tips=f"Focus on form for {ex.name}" 
        )
        schedule_items.append(item)
        
    db.add_all(schedule_items)
    db.commit()
    
    return new_schedule

def regenerate_schedule_from_db(db: Session, user: User):
    """
    Fungsi Pintar: Membaca data user terbaru dari DB, 
    menjalankan algoritma CSP, dan menyimpan jadwal baru.
    """
    # 1. Konversi Data Database (SQLAlchemy) -> Schema Pydantic (UserProfileInput)
    
    # Mapping Busy Times
    pydantic_busy_times = []
    for b in user.busy_times:
        # Konversi Time object ke string "HH:MM" jika ada
        start_str = b.start_time.strftime("%H:%M") if b.start_time else None
        end_str = b.end_time.strftime("%H:%M") if b.end_time else None
        
        pydantic_busy_times.append(BusyTimeInput(
            day=b.day_of_week.value if hasattr(b.day_of_week, 'value') else str(b.day_of_week),
            is_full_day=b.is_full_day,
            start_time=start_str,
            end_time=end_str
        ))

    # Mapping Injuries
    # Pastikan mengambil value string dari enum
    injury_list = [i.muscle_group.value if hasattr(i.muscle_group, 'value') else str(i.muscle_group) for i in user.injuries]

    # Mapping Enum Values untuk User Profile
    fitness_level = user.fitness_level.value if hasattr(user.fitness_level, 'value') else str(user.fitness_level)
    goal = user.main_goal.value if hasattr(user.main_goal, 'value') else str(user.main_goal)
    location = user.location_preference.value if hasattr(user.location_preference, 'value') else str(user.location_preference)
    pref_time = user.preferred_workout_time.value if hasattr(user.preferred_workout_time, 'value') else str(user.preferred_workout_time)

    user_input = UserProfileInput(
        weight=user.weight_kg or 0,
        height=user.height_cm or 0,
        fitness_level=fitness_level,
        goal=goal,
        location=location,
        sessions_per_week=user.target_sessions_per_week,
        preferred_workout_time=pref_time,
        busy_times=pydantic_busy_times,
        injuries=injury_list
    )

    # 2. Ambil Exercises
    exercises = db.query(Exercise).all()
    if not exercises:
        return None, "Exercise library kosong."

    # 3. Jalankan CSP
    try:
        generated_plan = csp_service.solve_csp_schedule(db, user_input, exercises)
    except Exception as e:
        return None, f"Error algoritma: {str(e)}"
    
    if not generated_plan:
        return None, "Gagal membuat jadwal (Constraint terlalu ketat/tidak ada slot waktu)."

    # 4. Simpan Jadwal Baru
    motivation = f"Jadwal diperbarui otomatis untuk {user.username} (via Chatbot)"
    new_schedule = save_generated_schedule(db, user.id, generated_plan, motivation)
    
    return new_schedule, "Sukses"