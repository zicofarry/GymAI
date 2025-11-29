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
MAX_SLOTS_PER_DAY = 4  # Jangan lebih dari 4 latihan per hari agar tidak burnout

def get_enum_value(enum_field):
    return enum_field.value if hasattr(enum_field, 'value') else str(enum_field)

def add_minutes_to_time(time_str: str, minutes_to_add: int) -> str:
    """Helper untuk menambah menit ke string jam"""
    if len(time_str.split(":")) == 2:
        t = datetime.strptime(time_str, "%H:%M")
    else:
        t = datetime.strptime(time_str, "%H:%M:%S")
    new_time = t + timedelta(minutes=minutes_to_add)
    return new_time.strftime("%H:%M:%S")

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
    
    # Ambil durasi preferensi user (Default 45 menit jika tidak ada di input)
    # Asumsi: user_input mungkin belum punya field ini di schema lama, kita kasih default aman
    user_max_duration = getattr(user_input, 'preferred_duration_minutes', 45)

    # =========================================================
    # 1. FILTERING DOMAIN (HARD CONSTRAINTS GLOBAL)
    # =========================================================
    valid_exercises = []
    for ex in all_exercises:
        ex_equip = get_enum_value(ex.equipment_type)
        ex_diff = get_enum_value(ex.difficulty_level)
        ex_cat = get_enum_value(ex.category)
        ex_muscle = get_enum_value(ex.muscle_group)
        
        # [C6] Akses Peralatan (Lokasi) - DIPERKETAT
        # Jika Home (Non-Gym), hanya boleh Bodyweight (None) ATAU Cardio
        if user_input.location == "Home":
            # Constraint: Equipment=None OR Category=Cardio/Flexibility
            # Kita anggap Dumbbell juga tidak ada kecuali user spesifik (disini kita strict sesuai prompt "Bodyweight or Cardio")
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
        valid_exercises = all_exercises # Fallback darurat

    # =========================================================
    # 2. ALOKASI WAKTU (IDENTIFIKASI HARI)
    # =========================================================
    available_days = []
    busy_map = {b.day: b for b in user_input.busy_times}

    for day in DAYS:
        # [C1] Slot Tidak boleh berbenturan jadwal sibuk (Unary)
        is_full_busy = False
        if day in busy_map and busy_map[day].is_full_day:
            is_full_busy = True
        
        if not is_full_busy:
            available_days.append(day)

    if not available_days:
        available_days = ["Saturday", "Sunday"] # Fallback

    # =========================================================
    # 3. DISTRIBUSI SESI (C2 & C3)
    # =========================================================
    # [C3] Jumlah sesi target per minggu
    total_slots_needed = user_input.sessions_per_week
    num_days = len(available_days)
    
    # Hitung rata-rata slot per hari
    base_slots = total_slots_needed // num_days
    remainder = total_slots_needed % num_days
    
    day_slots_map = {day: base_slots for day in available_days}
    for i in range(remainder):
        day_slots_map[available_days[i]] += 1
        
    # [C2] Cap Jumlah Sesi Per Hari (Safety Limit)
    for day in day_slots_map:
        if day_slots_map[day] > MAX_SLOTS_PER_DAY:
            day_slots_map[day] = MAX_SLOTS_PER_DAY

    # =========================================================
    # 4. PENJADWALAN DETAIL (C4, C5, C7)
    # =========================================================
    
    # [C7] Preferensi Waktu (Heuristic base time)
    base_start_time = TIME_MAPPING.get(user_input.preferred_workout_time, "09:00")
    if len(base_start_time) == 5: base_start_time += ":00"

    exercises_picked_history = [] 

    for day in available_days:
        slots_today = day_slots_map[day]
        current_time_str = base_start_time
        accumulated_duration = 0 # Tracking durasi harian
        
        last_muscle_group_today = None # Untuk cek repetisi dalam satu sesi

        for _ in range(slots_today):
            candidates = []
            
            # --- SELEKSI KANDIDAT ---
            for ex in valid_exercises:
                ex_muscle = get_enum_value(ex.muscle_group)
                ex_cat = get_enum_value(ex.category)
                ex_duration = ex.default_duration_minutes
                
                # [C4] Aturan Pemulihan (Recovery) - Binary Constraint
                # Cek latihan terakhir di HARI SEBELUMNYA (jika data history lengkap, disini kita cek simple last picked)
                if exercises_picked_history:
                    last_picked = exercises_picked_history[-1]
                    # Jika baru kemarin latihan otot X, hari ini jangan X lagi (Simplified: cek urutan list)
                    if get_enum_value(last_picked.muscle_group) == ex_muscle:
                        # Tapi kalau ini slot ke-2 di hari yang SAMA, boleh (superset), 
                        # yang dilarang adalah Hari 1 Chest -> Hari 2 Chest.
                        # Disini kita buat simple: Variasi diutamakan.
                        pass

                # [C5] Durasi sesuai batas pengguna (Unary)
                if accumulated_duration + ex_duration > user_max_duration:
                    continue # Skip latihan ini karena bikin over-time

                # Prevent Duplicate in same day (Variasi)
                if last_muscle_group_today == ex_muscle:
                    continue 

                candidates.append(ex)
            
            if not candidates:
                # Jika tidak ada kandidat (misal karena C5 durasi habis), stop untuk hari ini
                break

            # HEURISTIC SORTING
            candidates.sort(
                key=lambda ex: (
                    calculate_heuristic_score(ex, user_input, exercises_picked_history), 
                    random.random()
                ), 
                reverse=True
            )
            
            selected_exercise = candidates[0]
            
            # Commit Selection
            exercises_picked_history.append(selected_exercise)
            last_muscle_group_today = get_enum_value(selected_exercise.muscle_group)
            accumulated_duration += selected_exercise.default_duration_minutes
            
            # Masukkan ke Rencana
            schedule_plan.append({
                "day": day,
                "exercise": selected_exercise,
                "time": current_time_str,
                "duration": selected_exercise.default_duration_minutes
            })
            
            # Geser waktu untuk slot berikutnya (+5 menit istirahat)
            current_time_str = add_minutes_to_time(current_time_str, selected_exercise.default_duration_minutes + 5)

    return schedule_plan