from models import Exercise

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def get_enum_value(enum_field):
    """Helper untuk mengambil string dari Enum SQLAlchemy"""
    return enum_field.value if hasattr(enum_field, 'value') else str(enum_field)

def calculate_heuristic_score(exercise, user_input):
    score = 0
    
    # Ambil nilai string dari Enum database agar aman dibandingkan
    ex_difficulty = get_enum_value(exercise.difficulty_level)
    ex_category = get_enum_value(exercise.category)
    
    # 1. Fitness Level Match
    if ex_difficulty == user_input.fitness_level:
        score += 10
    
    # 2. Goal Match
    if user_input.goal == "Muscle Gain" and ex_category == "Strength":
        score += 5
    elif user_input.goal == "Fat Loss" and ex_category in ["Cardio", "HIIT"]:
        score += 5
    elif user_input.goal == "Flexibility" and ex_category == "Flexibility":
        score += 5
        
    return score

def solve_csp_schedule(db, user_input, all_exercises):
    schedule_plan = []
    
    valid_exercises = []
    for ex in all_exercises:
        ex_equip = get_enum_value(ex.equipment_type)
        
        # Constraint C6: Location & Equipment
        if user_input.location == "Home" and ex_equip not in ["None", "Dumbbell", "Resistance Band"]:
            continue 
        valid_exercises.append(ex)

    if not valid_exercises:
        valid_exercises = all_exercises 

    sessions_needed = user_input.sessions_per_week
    sessions_scheduled = 0
    last_muscle_group = None
    
    for day in DAYS:
        if sessions_scheduled >= sessions_needed:
            break
            
        # Constraint C1: Busy Times Check
        is_busy = False
        for busy in user_input.busy_times:
            # Sederhana: Jika hari ini ada di list busy (baik full day atau partial), skip dulu untuk keamanan
            # (Nanti bisa dikembangkan untuk cek jam spesifik)
            if busy.day == day and busy.is_full_day:
                is_busy = True
        
        if is_busy:
            continue 
            
        # Constraint C4: Recovery Check
        candidates = []
        for ex in valid_exercises:
            ex_muscle = get_enum_value(ex.muscle_group)
            if ex_muscle != last_muscle_group:
                candidates.append(ex)
        
        if not candidates:
            candidates = valid_exercises 

        # Sort berdasarkan Score Heuristik
        candidates_sorted = sorted(
            candidates, 
            key=lambda ex: (calculate_heuristic_score(ex, user_input), -ex.id), 
            reverse=True
        )
        
        selected_exercise = candidates_sorted[0]
        
        # Update last muscle untuk iterasi berikutnya
        last_muscle_group = get_enum_value(selected_exercise.muscle_group)
        sessions_scheduled += 1
        
        schedule_plan.append({
            "day": day,
            "exercise": selected_exercise,
            "time": "08:00:00", 
            "duration": selected_exercise.default_duration_minutes
        })
        
    return schedule_plan