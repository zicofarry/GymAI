from sqlalchemy.orm import Session
from app.models.user import User, UserBusyTime
from app.schemas.user import UserProfileInput

def update_user_profile(db: Session, user_id: int, profile_data: UserProfileInput):
    """
    Mengupdate data fisik user dan jadwal sibuknya (Busy Times).
    """
    # 1. Ambil User dari DB
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # 2. Update Field User (Berat, Tinggi, Goal, dll)
    user.weight_kg = profile_data.weight
    user.height_cm = profile_data.height
    user.fitness_level = profile_data.fitness_level
    user.main_goal = profile_data.goal
    user.location_preference = profile_data.location
    user.target_sessions_per_week = profile_data.sessions_per_week
    
    # 3. Update Busy Times (Hapus yang lama, Insert yang baru)
    # Ini cara paling aman untuk menghindari duplikasi data
    db.query(UserBusyTime).filter(UserBusyTime.user_id == user_id).delete()
    
    new_busy_times = []
    for busy in profile_data.busy_times:
        # Konversi string kosong "" menjadi None agar sesuai tipe data Time/Null di DB
        start = busy.start_time if busy.start_time else None
        end = busy.end_time if busy.end_time else None
        
        new_item = UserBusyTime(
            user_id=user_id,
            day_of_week=busy.day,
            is_full_day=busy.is_full_day,
            start_time=start,
            end_time=end
        )
        new_busy_times.append(new_item)
    
    db.add_all(new_busy_times)
    
    # 4. Commit Perubahan
    db.commit()
    db.refresh(user)
    return user
