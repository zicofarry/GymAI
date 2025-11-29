import random
from models import Exercise

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def solve_csp_schedule(db, user_input, all_exercises):
    schedule_plan = []
    
    # 1. Filter Exercises berdasarkan Location
    valid_exercises = []
    for ex in all_exercises:
        if user_input.location == "Home" and ex.equipment_type not in ["None", "Dumbbell", "Resistance Band"]:
            continue 
        valid_exercises.append(ex)

    # Fallback jika tidak ada latihan yang cocok (biar gak error kosong)
    if not valid_exercises:
        valid_exercises = all_exercises 

    # 2. Setup Slot Waktu
    sessions_needed = user_input.sessions_per_week
    sessions_scheduled = 0
    last_muscle_group = None
    
    # 3. Iterasi Hari
    for day in DAYS:
        if sessions_scheduled >= sessions_needed:
            break
            
        # Cek Busy Times
        is_busy_all_day = False
        for busy in user_input.busy_times:
            if busy.day == day and busy.is_full_day:
                is_busy_all_day = True
        
        if is_busy_all_day:
            continue 
            
        # Cek Recovery (Otot tidak boleh sama berturut-turut)
        candidates = [ex for ex in valid_exercises if ex.muscle_group != last_muscle_group]
        
        if not candidates:
            candidates = valid_exercises 
            
        selected_exercise = random.choice(candidates)
        
        last_muscle_group = selected_exercise.muscle_group
        sessions_scheduled += 1
        
        schedule_plan.append({
            "day": day,
            "exercise": selected_exercise,
            "time": "08:00:00", 
            "duration": selected_exercise.default_duration_minutes
        })
        
    return schedule_plan
