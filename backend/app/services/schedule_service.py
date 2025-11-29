from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.schedule import Schedule, ScheduleItem
from app.models.user import User

def save_generated_schedule(db: Session, user_id: int, generated_plan: list, motivation_text: str):
    """
    Menyimpan hasil algoritma CSP ke dalam tabel schedules dan schedule_items.
    """
    # 1. Set Tanggal (Misal: Mulai besok sampai 7 hari ke depan)
    start_date = date.today() + timedelta(days=1)
    end_date = start_date + timedelta(days=6)
    
    # 2. Non-aktifkan jadwal lama user ini (jika ada)
    # Agar user hanya punya 1 jadwal aktif dalam satu waktu
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
        item = ScheduleItem(
            schedule_id=new_schedule.id,
            exercise_id=plan["exercise"].id,
            day_of_week=plan["day"],
            scheduled_time=plan["time"],
            duration_minutes=plan["duration"],
            is_completed=False,
            ai_custom_tips=f"Focus on form for {plan['exercise'].name}" # Placeholder tip
        )
        schedule_items.append(item)
        
    db.add_all(schedule_items)
    db.commit()
    
    return new_schedule
