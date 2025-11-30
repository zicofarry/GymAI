from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.schemas.user import UserProfileInput
from datetime import datetime, timedelta
import random

# --- KONSTANTA & KONFIGURASI ---
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Mapping Jam Mulai Default (C7 - Preferensi Waktu)
TIME_MAPPING = {
    "Morning": "07:00",
    "Afternoon": "14:00",
    "Evening": "18:30",
    "Night": "20:00",
    "Anytime": "09:00"
}

# Batas Maksimum (C2)
MAX_SLOTS_PER_DAY = 4 

def get_enum_value(enum_field):
    return enum_field.value if hasattr(enum_field, 'value') else str(enum_field)

def add_minutes_to_time(time_str: str, minutes_to_add: int) -> str:
    """Helper untuk menambah menit ke string jam"""
    # Normalisasi format detik
    if len(time_str.split(":")) == 2:
        time_str += ":00"
        
    t = datetime.strptime(time_str, "%H:%M:%S")
    new_time = t + timedelta(minutes=minutes_to_add)
    return new_time.strftime("%H:%M:%S")

def is_time_overlapped(current_time_str: str, duration_mins: int, busy_slots: list) -> tuple[bool, str]:
    """
    Cek apakah waktu latihan bentrok dengan busy slot.
    Returns: (is_overlapped, suggested_new_time)
    """
    if len(current_time_str.split(":")) == 2: current_time_str += ":00"
    
    workout_start = datetime.strptime(current_time_str, "%H:%M:%S")
    workout_end = workout_start + timedelta(minutes=duration_mins)
    
    for slot in busy_slots:
        if slot.is_full_day:
            return True, None # Skip day entirely
            
        if not slot.start_time or not slot.end_time:
            continue

        # Convert slot times to datetime objects (dummy date same as workout)
        # Handle format HH:MM vs HH:MM:SS
        s_str = slot.start_time if len(slot.start_time.split(":")) == 3 else slot.start_time + ":00"
        e_str = slot.end_time if len(slot.end_time.split(":")) == 3 else slot.end_time + ":00"
        
        busy_start = datetime.strptime(s_str, "%H:%M:%S")
        busy_end = datetime.strptime(e_str, "%H:%M:%S")
        
        # Logika Overlap: Start latihan < End sibuk AND End latihan > Start sibuk
        if workout_start < busy_end and workout_end > busy_start:
            # Jika bentrok, sarankan waktu baru = waktu selesai sibuk + 5 menit buffer
            suggested_time = (busy_end + timedelta(minutes=5)).strftime("%H:%M:%S")
            return True, suggested_time
            
    return False, current_time_str

def calculate_heuristic_score(exercise: Exercise, user_input: UserProfileInput, prev_exercises: list) -> int:
    score = 0
    ex_cat = get_enum_value(exercise.category)
    ex_muscle = get_enum_value(exercise.muscle_group)
    ex_equip = get_enum_value(exercise.equipment_type)
    
    # 1. Match Level (Relevansi)
    if get_enum_value(exercise.difficulty_level) == user_input.fitness_level: 
        score += 10
    
    # 2. Match Goal (Efektivitas)
    if user_input.goal == "Muscle Gain" and ex_cat == "Strength": score += 5
    elif user_input.goal == "Fat Loss" and ex_cat in ["Cardio", "HIIT"]: score += 5
    elif user_input.goal == "Flexibility" and ex_cat == "Flexibility": score += 5
    
    # 3. Prioritas Alat Gym (C6 Soft)
    if user_input.location == "Gym" and ex_equip in ["Barbell", "Machine"]: 
        score += 3
        
    # 4. Variasi (Anti-Bosan)
    recent_muscles = [get_enum_value(e.muscle_group) for e in prev_exercises[-3:]]
    if ex_muscle not in recent_muscles: 
        score += 4 

    return score

def solve_csp_schedule(db: Session, user_input: UserProfileInput, all_exercises: list[Exercise]):
    schedule_plan = []
    user_max_duration = getattr(user_input, 'preferred_duration_minutes', 45)

    # 1. FILTERING DOMAIN (HARD CONSTRAINTS GLOBAL)
    valid_exercises = []
    for ex in all_exercises:
        ex_equip = get_enum_value(ex.equipment_type)
        ex_diff = get_enum_value(ex.difficulty_level)
        ex_cat = get_enum_value(ex.category)
        ex_muscle = get_enum_value(ex.muscle_group)
        
        # [C6] Constraint Lokasi
        if user_input.location == "Home":
            if ex_equip != "None" and ex_cat not in ["Cardio", "HIIT", "Flexibility"]:
                continue 
                
        # [Safety] Level Check
        if user_input.fitness_level == "Beginner" and ex_diff == "Advanced":
            continue

        # [Safety] Injury Check
        if ex_muscle in user_input.injuries:
            continue
            
        valid_exercises.append(ex)

    if not valid_exercises:
        valid_exercises = all_exercises

    # 2. ALOKASI WAKTU & PREPARASI BUSY SLOTS
    # Kelompokkan busy times berdasarkan hari agar bisa handle multiple slots per hari
    busy_slots_by_day = {day: [] for day in DAYS}
    for b in user_input.busy_times:
        if b.day in busy_slots_by_day:
            busy_slots_by_day[b.day].append(b)

    available_days = []
    for day in DAYS:
        # Cek apakah ada slot Full Day Busy
        is_full_busy = any(b.is_full_day for b in busy_slots_by_day[day])
        if not is_full_busy:
            available_days.append(day)

    if not available_days:
        available_days = ["Saturday", "Sunday"]

    # 3. DISTRIBUSI SESI
    total_slots_needed = user_input.sessions_per_week
    num_days = len(available_days)
    
    base_slots = total_slots_needed // num_days
    remainder = total_slots_needed % num_days
    
    day_slots_map = {day: base_slots for day in available_days}
    for i in range(remainder):
        day_slots_map[available_days[i]] += 1
        
    for day in day_slots_map:
        if day_slots_map[day] > MAX_SLOTS_PER_DAY:
            day_slots_map[day] = MAX_SLOTS_PER_DAY

    # 4. PENJADWALAN DETAIL DENGAN COLLISION DETECTION
    base_start_time = TIME_MAPPING.get(user_input.preferred_workout_time, "09:00")
    if len(base_start_time) == 5: base_start_time += ":00"

    exercises_picked_history = [] 

    for day in available_days:
        slots_today = day_slots_map[day]
        current_time_str = base_start_time
        accumulated_duration = 0 
        last_muscle_group_today = None
        
        # Ambil busy slots untuk hari ini
        todays_busy_slots = busy_slots_by_day[day]

        for _ in range(slots_today):
            # --- [BARU] LOGIKA GESER WAKTU ---
            # Kita asumsikan durasi minimal latihan sekitar 15 menit untuk cek bentrok
            is_clash, new_start = is_time_overlapped(current_time_str, 15, todays_busy_slots)
            
            # Loop untuk terus menggeser waktu jika masih bentrok dengan slot berikutnya
            attempts = 0
            while is_clash and attempts < 5:
                if new_start is None: # Full day busy blocked late check
                    break
                current_time_str = new_start
                is_clash, new_start = is_time_overlapped(current_time_str, 15, todays_busy_slots)
                attempts += 1
            
            if is_clash and new_start is None:
                break # Hari ini skip karena full day
            # ---------------------------------

            candidates = []
            
            for ex in valid_exercises:
                ex_muscle = get_enum_value(ex.muscle_group)
                ex_duration = ex.default_duration_minutes
                
                # Cek constraint durasi harian
                if accumulated_duration + ex_duration > user_max_duration:
                    continue

                if last_muscle_group_today == ex_muscle:
                    continue 

                candidates.append(ex)
            
            if not candidates:
                break

            candidates.sort(
                key=lambda ex: (
                    calculate_heuristic_score(ex, user_input, exercises_picked_history), 
                    random.random()
                ), 
                reverse=True
            )
            
            selected_exercise = candidates[0]
            
            exercises_picked_history.append(selected_exercise)
            last_muscle_group_today = get_enum_value(selected_exercise.muscle_group)
            accumulated_duration += selected_exercise.default_duration_minutes
            
            schedule_plan.append({
                "day": day,
                "exercise": selected_exercise,
                "time": current_time_str,
                "duration": selected_exercise.default_duration_minutes
            })
            
            current_time_str = add_minutes_to_time(current_time_str, selected_exercise.default_duration_minutes + 5)

    return schedule_plan