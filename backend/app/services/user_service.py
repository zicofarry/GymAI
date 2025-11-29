from sqlalchemy.orm import Session
from app.models.user import User, UserBusyTime, UserInjury
from app.schemas.user import UserProfileInput

def update_user_profile(db: Session, user_id: int, profile_data: UserProfileInput):
    """
    Mengupdate profil lengkap user termasuk busy times dan injuries.
    """
    # 1. Ambil User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # 2. Update Field Dasar
    user.weight_kg = profile_data.weight
    user.height_cm = profile_data.height
    user.fitness_level = profile_data.fitness_level
    user.main_goal = profile_data.goal
    user.location_preference = profile_data.location
    user.target_sessions_per_week = profile_data.sessions_per_week
    
    # Update Time Preference (Cek atribut untuk keamanan)
    if hasattr(profile_data, 'preferred_workout_time'):
        user.preferred_workout_time = profile_data.preferred_workout_time
    
    # 3. Update Busy Times (Reset & Insert)
    db.query(UserBusyTime).filter(UserBusyTime.user_id == user_id).delete()
    for busy in profile_data.busy_times:
        start = busy.start_time if busy.start_time else None
        end = busy.end_time if busy.end_time else None
        new_busy = UserBusyTime(
            user_id=user_id,
            day_of_week=busy.day,
            is_full_day=busy.is_full_day,
            start_time=start,
            end_time=end
        )
        db.add(new_busy)

    # 4. Update Injuries (Reset & Insert)
    # Cek dulu apakah user_input punya injuries (agar aman jika skema lama dipakai)
    if hasattr(profile_data, 'injuries'):
        db.query(UserInjury).filter(UserInjury.user_id == user_id).delete()
        for muscle in profile_data.injuries:
            # Pastikan muscle bukan string kosong
            if muscle:
                new_injury = UserInjury(
                    user_id=user_id,
                    muscle_group=muscle
                )
                db.add(new_injury)
    
    db.commit()
    db.refresh(user)
    return user