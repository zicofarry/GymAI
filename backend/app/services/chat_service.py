import google.generativeai as genai
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User, UserBusyTime
from app.models.log import UserLog
from app.models.schedule import Schedule, ScheduleItem
from datetime import datetime
from app.services import schedule_service

# Konfigurasi Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# ==========================================
# 1. DEFINISI TOOLS (Fungsi Python Asli)
# ==========================================

def tool_update_profile(
    db: Session, 
    user: User, 
    weight: float = None, 
    height: int = None, 
    goal: str = None, 
    level: str = None, 
    location: str = None, 
    sessions: int = None
):
    """Mengupdate profil DAN me-regenerate jadwal."""
    changes = []
    
    if weight is not None:
        user.weight_kg = weight
        changes.append(f"Berat: {weight}kg")
    
    if height is not None:
        user.height_cm = height
        changes.append(f"Tinggi: {height}cm")
    if goal is not None:
        user.main_goal = goal.title()
        changes.append(f"Goal: {goal}")
    if level is not None:
        user.fitness_level = level.title()
        changes.append(f"Level: {level}")
    if location is not None:
        user.location_preference = location.title()
        changes.append(f"Lokasi: {location}")
    if sessions is not None:
        user.target_sessions_per_week = sessions
        changes.append(f"Sesi: {sessions}x")

    db.commit()
    db.refresh(user)

    # Auto Regenerate
    new_sched, msg = schedule_service.regenerate_schedule_from_db(db, user)
    status_msg = "✅ Jadwal latihanmu sudah diperbarui!" if new_sched else f"⚠️ Gagal update jadwal: {msg}"

    return f"SUKSES: Profil diupdate ({', '.join(changes)}). {status_msg}"

def tool_manage_busy_time(
    db: Session, 
    user: User, 
    day: str, 
    action: str, # 'set_busy' atau 'set_free'
    start_time: str = None, 
    end_time: str = None, 
    is_full_day: bool = False
):
    """
    Menambah ATAU Menghapus waktu sibuk, lalu regenerate jadwal.
    Bisa handle: "Senin sibuk" (add) atau "Senin jadi kosong" (remove).
    """
    day_capitalized = day.title() # Pastikan Monday, Tuesday, dll
    
    if action == "set_free":
        # HAPUS busy time di hari tersebut
        deleted = db.query(UserBusyTime).filter(
            UserBusyTime.user_id == user.id,
            UserBusyTime.day_of_week == day_capitalized
        ).delete()
        db.commit()
        msg_action = f"Jadwal sibuk hari {day_capitalized} DIHAPUS (Sekarang Free)."
        
    else: # action == "set_busy"
        # Tambah/Update busy time (Hapus dulu yang lama di hari itu biar gak duplikat)
        db.query(UserBusyTime).filter(
            UserBusyTime.user_id == user.id,
            UserBusyTime.day_of_week == day_capitalized
        ).delete()
        
        new_busy = UserBusyTime(
            user_id=user.id,
            day_of_week=day_capitalized,
            is_full_day=is_full_day,
            start_time=start_time + ":00" if start_time else None,
            end_time=end_time + ":00" if end_time else None
        )
        db.add(new_busy)
        db.commit()
        time_info = "seharian" if is_full_day else f"jam {start_time}-{end_time}"
        msg_action = f"Jadwal sibuk hari {day_capitalized} ({time_info}) DITAMBAHKAN."

    db.refresh(user)

    # Auto Regenerate Jadwal
    new_sched, msg = schedule_service.regenerate_schedule_from_db(db, user)
    
    if new_sched:
        return f"SUKSES: {msg_action} ✅ Jadwal latihan sudah disusun ulang!"
    else:
        return f"SUKSES: {msg_action} ⚠️ Tapi gagal update jadwal latihan: {msg}"

def tool_log_workout(db: Session, user: User, feedback: str, duration_minutes: int):
    """Log latihan & centang jadwal."""
    today_name = datetime.now().strftime("%A")
    
    active_schedule = db.query(Schedule).filter(
        Schedule.user_id == user.id,
        Schedule.is_active == True
    ).first()
    
    matched_item = None
    schedule_info = ""
    
    if active_schedule:
        target_item = db.query(ScheduleItem).filter(
            ScheduleItem.schedule_id == active_schedule.id,
            ScheduleItem.day_of_week == today_name,
            ScheduleItem.is_completed == False
        ).first()
        
        if target_item:
            target_item.is_completed = True
            matched_item = target_item
            schedule_info = f"(Jadwal '{target_item.exercise.name}' hari ini otomatis dicentang selesai ✅)"

    new_log = UserLog(
        user_id=user.id,
        schedule_item_id=matched_item.id if matched_item else None,
        actual_duration_minutes=duration_minutes,
        feedback_text=feedback,
        rating=5, 
        log_date=datetime.now()
    )
    db.add(new_log)
    db.commit()
    
    return f"SUKSES: Log latihan tercatat. {schedule_info}"

# Mapping Function
available_functions = {
    "update_profile": tool_update_profile,
    "manage_busy_time": tool_manage_busy_time, # <-- Nama baru
    "log_workout": tool_log_workout
}

# ==========================================
# 2. CHAT ENGINE
# ==========================================

class ChatService:
    def __init__(self):
        self.tools_schema = [
            {
                "function_declarations": [
                    {
                        "name": "update_profile",
                        "description": "Update data fisik/preferensi user.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "weight": {"type": "NUMBER"},
                                "height": {"type": "INTEGER"},
                                "goal": {"type": "STRING"},
                                "level": {"type": "STRING"},
                                "location": {"type": "STRING"},
                                "sessions": {"type": "INTEGER"}
                            }
                        }
                    },
                    {
                        "name": "manage_busy_time",
                        "description": "Atur ketersediaan waktu user. Bisa MENAMBAH kesibukan (tidak bisa latihan) atau MENGHAPUS kesibukan (jadi bisa latihan).",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "day": {
                                    "type": "STRING", 
                                    "description": "Hari (English: Monday, Tuesday, ...)"
                                },
                                "action": {
                                    "type": "STRING",
                                    "description": "Pilih 'set_busy' jika user bilang sibuk/tidak bisa. Pilih 'set_free' jika user bilang kosong/bisa/available/batal sibuk."
                                },
                                "start_time": {"type": "STRING"},
                                "end_time": {"type": "STRING"},
                                "is_full_day": {"type": "BOOLEAN"}
                            },
                            "required": ["day", "action"]
                        }
                    },
                    {
                        "name": "log_workout",
                        "description": "Lapor selesai latihan.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "feedback": {"type": "STRING"},
                                "duration_minutes": {"type": "INTEGER"}
                            },
                            "required": ["feedback", "duration_minutes"]
                        }
                    }
                ]
            }
        ]
        
        self.model_info = genai.GenerativeModel('gemini-2.0-flash')
        self.model_action = genai.GenerativeModel(
            model_name='gemini-2.0-flash', 
            tools=self.tools_schema
        )

    async def process_chat(self, db: Session, user: User, message: str, mode: str):
        if mode == "action":
            return await self._handle_action_mode(db, user, message)
        else:
            return await self._handle_info_mode(user, message)

    async def _handle_info_mode(self, user: User, message: str):
        """Menangani Chat Biasa dengan Konteks User (Context-Aware)"""
        
        # 1. Siapkan Data Konteks (Contekan buat AI)
        # Handle Enum value agar bersih string-nya
        fitness_val = user.fitness_level.value if hasattr(user.fitness_level, 'value') else str(user.fitness_level)
        goal_val = user.main_goal.value if hasattr(user.main_goal, 'value') else str(user.main_goal)
        
        # Ambil daftar cedera
        injury_list = [i.muscle_group.value if hasattr(i.muscle_group, 'value') else str(i.muscle_group) for i in user.injuries]
        injuries_str = ", ".join(injury_list) if injury_list else "Tidak ada cedera"

        # 2. Susun Prompt
        prompt = f"""
        PERAN:
        Kamu adalah Personal Trainer AI (GymAI) untuk user bernama {user.username}.
        
        DATA KLIEN KAMU SAAT INI:
        - Berat Badan: {user.weight_kg} kg
        - Tinggi Badan: {user.height_cm} cm
        - Level Fitness: {fitness_val}
        - Goal Utama: {goal_val}
        - Jadwal Latihan: {user.target_sessions_per_week}x seminggu
        - Cedera/Pantangan: {injuries_str}
        
        TUGAS:
        Jawab pertanyaan user berdasarkan DATA KLIEN di atas.
        - Jika user bertanya "Berapa berat saya?", jawab sesuai data.
        - Jika user bertanya saran latihan, sesuaikan dengan Level dan Cedera mereka.
        - Jadilah ramah, suportif, dan memotivasi.
        
        PERTANYAAN USER:
        {message}
        """
        
        try:
            response = await self.model_info.generate_content_async(prompt)
            return response.text
        except Exception as e:
            return f"Error Info: {str(e)}"

    async def _handle_action_mode(self, db: Session, user: User, message: str):
        chat = self.model_action.start_chat(enable_automatic_function_calling=False)
        
        # PROMPT INI KUNCI AGAR AI PINTAR MENERJEMAHKAN BAHASA ALAMI
        prompt = f"""
        Tugas: Analisis perintah user dan panggil Tool yang tepat.
        
        Rules untuk Waktu Sibuk:
        - Jika user bilang "Sibuk", "Gak bisa", "Ada acara" -> action="set_busy"
        - Jika user bilang "Kosong", "Bisa", "Available", "Gak jadi sibuk", "Free" -> action="set_free"
        
        User: {message}
        """
        
        try:
            response = await chat.send_message_async(prompt)
            
            # Handle Parallel Function Call (Jika user sebut banyak hari sekaligus)
            # Gemini 2.0 bisa return list function calls
            function_calls = self._get_function_calls(response)
            
            if function_calls:
                results = []
                for fc in function_calls:
                    res = self._execute_function(fc, db, user)
                    results.append(res)
                return "\n".join(results)
            else:
                return "Maaf, saya tidak menangkap perintah data yang valid. Coba lebih spesifik."
                
        except Exception as e:
            return f"Error Aksi: {str(e)}"

    def _get_function_calls(self, response):
        """Mendukung Multiple Function Calls (Contoh: Senin dan Kamis kosong)"""
        try:
            # Cek di candidate pertama
            parts = response.candidates[0].content.parts
            calls = []
            for part in parts:
                if part.function_call and part.function_call.name:
                    calls.append(part.function_call)
            return calls
        except:
            return []

    def _execute_function(self, function_call, db, user):
        fn_name = function_call.name
        fn_args = function_call.args
        
        if fn_name in available_functions:
            func = available_functions[fn_name]
            try:
                if fn_name == "update_profile":
                    return func(db, user, **dict(fn_args))
                elif fn_name == "manage_busy_time": # <-- Tool baru
                    return func(db, user, **dict(fn_args))
                elif fn_name == "log_workout":
                    return func(db, user, fn_args["feedback"], int(fn_args["duration_minutes"]))
            except Exception as e:
                return f"Gagal eksekusi: {str(e)}"
        
        return "Fungsi tidak valid."

chat_service = ChatService()