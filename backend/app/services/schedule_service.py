from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.schedule import Schedule, ScheduleItem
from app.models.user import User
from app.models.exercise import Exercise
from app.services import csp_service
from app.schemas.user import UserProfileInput, BusyTimeInput

# --- ASYNC SAVE FUNCTION ---
async def save_generated_schedule(db: Session, user: User, generated_plan: list):
    """
    Menyimpan hasil algoritma CSP ke database dengan pengayaan AI (Tips & Motivasi).
    """
    # LOCAL IMPORT untuk menghindari Circular Dependency Error
    from app.services.chat_service import chat_service 

    # 1. Generate Motivasi Mingguan (AI)
    goal_val = user.main_goal.value if hasattr(user.main_goal, 'value') else str(user.main_goal)
    try:
        motivation_text = await chat_service.generate_motivation(user.username, goal_val)
    except:
        motivation_text = f"Halo {user.username}, jadwal baru siap! Fokus ke {goal_val} ya!"

    # 2. Setup Tanggal
    start_date = date.today() + timedelta(days=1)
    end_date = start_date + timedelta(days=6)
    
    # 3. Matikan jadwal lama
    existing_schedules = db.query(Schedule).filter(
        Schedule.user_id == user.id, 
        Schedule.is_active == True
    ).all()
    for sch in existing_schedules:
        sch.is_active = False
    
    # 4. Create Header
    new_schedule = Schedule(
        user_id=user.id,
        start_date=start_date,
        end_date=end_date,
        is_active=True,
        ai_weekly_motivation=motivation_text
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    
    # 5. Create Items dengan Tips AI
    schedule_items = []
    fitness_val = user.fitness_level.value if hasattr(user.fitness_level, 'value') else str(user.fitness_level)

    for plan in generated_plan:
        ex = plan["exercise"]
        
        # Generate Tips (Async)
        try:
            ai_tip = await chat_service.generate_workout_tip(ex.name, fitness_val)
        except:
            ai_tip = f"Lakukan {ex.name} dengan teknik yang tepat."

        item = ScheduleItem(
            schedule_id=new_schedule.id,
            exercise_id=ex.id,
            day_of_week=plan["day"],
            scheduled_time=plan["time"],
            duration_minutes=plan["duration"],
            is_completed=False,
            ai_custom_tips=ai_tip
        )
        schedule_items.append(item)
        
    db.add_all(schedule_items)
    db.commit()
    
    return new_schedule

# --- ASYNC REGENERATE FUNCTION ---
async def regenerate_schedule_from_db(db: Session, user: User):
    """
    Wrapper Pintar: Baca DB -> CSP Algo -> Save to DB (Async).
    """
    # 1. Mapping Data User
    pydantic_busy_times = []
    for b in user.busy_times:
        start_str = b.start_time.strftime("%H:%M") if b.start_time else None
        end_str = b.end_time.strftime("%H:%M") if b.end_time else None
        pydantic_busy_times.append(BusyTimeInput(
            day=b.day_of_week.value if hasattr(b.day_of_week, 'value') else str(b.day_of_week),
            is_full_day=b.is_full_day,
            start_time=start_str,
            end_time=end_str
        ))

    injury_list = [i.muscle_group.value if hasattr(i.muscle_group, 'value') else str(i.muscle_group) for i in user.injuries]
    
    def get_val(x): return x.value if hasattr(x, 'value') else str(x)

    user_input = UserProfileInput(
        weight=user.weight_kg or 0,
        height=user.height_cm or 0,
        fitness_level=get_val(user.fitness_level),
        goal=get_val(user.main_goal),
        location=get_val(user.location_preference),
        sessions_per_week=user.target_sessions_per_week,
        preferred_workout_time=get_val(user.preferred_workout_time),
        busy_times=pydantic_busy_times,
        injuries=injury_list
    )

    # 2. CSP Logic
    exercises = db.query(Exercise).all()
    if not exercises: return None, "Library kosong."

    try:
        generated_plan = csp_service.solve_csp_schedule(db, user_input, exercises)
    except Exception as e:
        return None, f"Error algoritma: {str(e)}"
    
    if not generated_plan:
        return None, "Gagal generate (Constraint terlalu ketat)."

    # 3. Save Async
    new_schedule = await save_generated_schedule(db, user, generated_plan)
    
    return new_schedule, "Sukses"