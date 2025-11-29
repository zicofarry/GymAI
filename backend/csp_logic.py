from models import Exercise

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def calculate_heuristic_score(exercise, user_input):
    """
    Fungsi untuk menilai seberapa cocok sebuah latihan dengan user.
    Semakin tinggi nilai, semakin direkomendasikan.
    """
    score = 0
    
    # 1. HEURISTIC: Fitness Level Match (Bobot Tertinggi: 10 poin)
    # Agar beginner tidak dikasih latihan expert, dan sebaliknya.
    if exercise.difficulty_level == user_input.fitness_level:
        score += 10
    
    # 2. HEURISTIC: Goal Match (Bobot: 5 poin)
    # Sesuaikan jenis latihan dengan tujuan utama
    if user_input.goal == "Muscle Gain" and exercise.category == "Strength":
        score += 5
    elif user_input.goal == "Fat Loss" and exercise.category in ["Cardio", "HIIT"]:
        score += 5
    elif user_input.goal == "Flexibility" and exercise.category == "Flexibility":
        score += 5
        
    return score

def solve_csp_schedule(db, user_input, all_exercises):
    schedule_plan = []
    
    # --- STEP 1: Domain Reduction (Filter Awal) ---
    valid_exercises = []
    for ex in all_exercises:
        # Constraint C6: Location & Equipment
        if user_input.location == "Home" and ex.equipment_type not in ["None", "Dumbbell", "Resistance Band"]:
            continue 
        valid_exercises.append(ex)

    if not valid_exercises:
        valid_exercises = all_exercises 

    # --- STEP 2: Setup Variable ---
    sessions_needed = user_input.sessions_per_week
    sessions_scheduled = 0
    last_muscle_group = None
    
    # --- STEP 3: Backtracking / Greedy Search ---
    for day in DAYS:
        # Goal State Check: Apakah target sesi sudah terpenuhi?
        if sessions_scheduled >= sessions_needed:
            break
            
        # Constraint C1: Busy Times Check
        is_busy_all_day = False
        for busy in user_input.busy_times:
            if busy.day == day and busy.is_full_day:
                is_busy_all_day = True
        
        if is_busy_all_day:
            continue 
            
        # Constraint C4: Recovery Check
        # Ambil kandidat yang ototnya beda dengan hari sebelumnya
        candidates = [ex for ex in valid_exercises if ex.muscle_group != last_muscle_group]
        
        # Soft Constraint Fallback: Jika tidak ada pilihan, paksa ambil dari semua valid
        if not candidates:
            candidates = valid_exercises 

        # === INI BAGIAN UTAMA PERUBAHANNYA ===
        # Alih-alih random, kita urutkan kandidat berdasarkan SKOR TERTINGGI
        # Sort key: (Score menurun, ID menaik) -> ID dipakai biar kalau skor seri, urutannya tetap sama (Deterministik)
        candidates_sorted = sorted(
            candidates, 
            key=lambda ex: (calculate_heuristic_score(ex, user_input), -ex.id), 
            reverse=True
        )
        
        # Pilih yang skornya paling tinggi (elemen pertama)
        selected_exercise = candidates_sorted[0]
        # =====================================
        
        last_muscle_group = selected_exercise.muscle_group
        sessions_scheduled += 1
        
        schedule_plan.append({
            "day": day,
            "exercise": selected_exercise,
            "time": "08:00:00", 
            "duration": selected_exercise.default_duration_minutes
        })
        
    return schedule_plan