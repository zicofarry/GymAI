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
# 1. DEFINISI TOOLS (ASYNC)
# ==========================================

async def tool_update_profile(db: Session, user: User, **kwargs):
    """Mengupdate profil DAN me-regenerate jadwal."""
    changes = []
    
    # Mapping field yang fleksibel
    if 'weight' in kwargs:
        user.weight_kg = kwargs['weight']
        changes.append(f"Berat: {kwargs['weight']}kg")
    if 'height' in kwargs:
        user.height_cm = kwargs['height']
        changes.append(f"Tinggi: {kwargs['height']}cm")
    if 'goal' in kwargs:
        user.main_goal = kwargs['goal'].title()
        changes.append(f"Goal: {kwargs['goal']}")
    if 'level' in kwargs:
        user.fitness_level = kwargs['level'].title()
        changes.append(f"Level: {kwargs['level']}")
    if 'location' in kwargs:
        user.location_preference = kwargs['location'].title()
        changes.append(f"Lokasi: {kwargs['location']}")
    if 'sessions' in kwargs:
        user.target_sessions_per_week = kwargs['sessions']
        changes.append(f"Sesi: {kwargs['sessions']}x")

    db.commit()
    db.refresh(user)

    # FIX: Tambahkan 'await' karena regenerate_schedule_from_db adalah async
    new_sched, msg = await schedule_service.regenerate_schedule_from_db(db, user)
    
    status_msg = "✅ Jadwal latihanmu sudah diperbarui otomatis!" if new_sched else f"⚠️ Profil update, tapi jadwal gagal: {msg}"
    return f"SUKSES: Profil diupdate ({', '.join(changes)}). {status_msg}"

async def tool_manage_busy_time(db: Session, user: User, day: str, action: str, start_time: str = None, end_time: str = None, is_full_day: bool = False):
    """Manage busy time DAN regenerate jadwal."""
    day_capitalized = day.title()
    
    if action == "set_free":
        # HAPUS busy time di hari tersebut
        db.query(UserBusyTime).filter(
            UserBusyTime.user_id == user.id,
            UserBusyTime.day_of_week == day_capitalized
        ).delete()
        db.commit()
        msg_action = f"Jadwal sibuk hari {day_capitalized} DIHAPUS (Free)."
    else:
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

    # FIX: Tambahkan 'await'
    new_sched, msg = await schedule_service.regenerate_schedule_from_db(db, user)
    
    if new_sched:
        return f"SUKSES: {msg_action} ✅ Jadwal latihan sudah disusun ulang agar tidak bentrok!"
    else:
        return f"SUKSES: {msg_action} ⚠️ Tapi gagal update jadwal latihan: {msg}"

async def tool_log_workout(db: Session, user: User, feedback: str, duration_minutes: int):
    today_name = datetime.now().strftime("%A")
    active_schedule = db.query(Schedule).filter(Schedule.user_id == user.id, Schedule.is_active == True).first()
    
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

# Mapping
available_functions = {
    "update_profile": tool_update_profile,
    "manage_busy_time": tool_manage_busy_time,
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
                                "day": {"type": "STRING", "description": "Hari (English: Monday, Tuesday, ...)"},
                                "action": {"type": "STRING", "description": "Pilih 'set_busy' jika user bilang sibuk. Pilih 'set_free' jika user bilang kosong/bisa."},
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

    # --- FITUR GENERATOR KONTEN ---
    
    async def generate_workout_tip(self, exercise_name: str, fitness_level: str) -> str:
        prompt = f"Berikan 1 kalimat tips singkat, padat, dan menyemangati untuk melakukan gerakan '{exercise_name}' bagi user level {fitness_level}. Fokus pada teknik atau semangat. Bahasa Indonesia gaul."
        try:
            response = await self.model_info.generate_content_async(prompt)
            return response.text.strip()
        except:
            return f"Lakukan {exercise_name} dengan teknik yang benar dan fokus."

    async def generate_motivation(self, user_name: str, goal: str) -> str:
        prompt = f"Berikan 1 kalimat motivasi pendek dan punchy untuk {user_name} yang goal-nya '{goal}'. Gaya bahasa pelatih gym yang asik."
        try:
            response = await self.model_info.generate_content_async(prompt)
            return response.text.strip()
        except:
            return f"Halo {user_name}, semangat kejar target {goal} kamu minggu ini!"

    async def generate_weekly_report(self, user_name: str, logs: list) -> str:
        if not logs:
            return "Belum ada data latihan minggu ini. Yuk mulai latihan!"

        log_summary = "\n".join([
            f"- {log.log_date.strftime('%A')}: {log.schedule_item.exercise.name if log.schedule_item else 'Latihan Bebas'} ({log.actual_duration_minutes} menit, {log.rating}/5)"
            for log in logs
        ])

        prompt = f"""
        PERAN: Personal Trainer AI.
        TUGAS: Buat laporan progres mingguan singkat (1 paragraf) untuk {user_name}.
        DATA LATIHAN MINGGU INI:
        {log_summary}
        
        INSTRUKSI:
        - Puji konsistensi jika banyak latihan.
        - Beri dorongan jika ada yang bolong.
        - Sebutkan total kalori atau durasi secara naratif.
        - Gaya bahasa: Santai, suportif, seperti teman fitness.
        """
        try:
            response = await self.model_info.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            return "Gagal membuat laporan mingguan."

    async def analyze_performance(self, user: User, logs: list, schedule_items: list) -> str:
        completed_count = len(logs)
        planned_count = len(schedule_items)
        
        prompt = f"""
        PERAN: Senior Fitness Coach GymAI.
        DATA USER: {user.username} (Goal: {user.main_goal}, Level: {user.fitness_level}).
        DATA MINGGU INI:
        - Rencana: {planned_count} sesi.
        - Realisasi: {completed_count} sesi selesai.
        
        TUGAS:
        Berikan 3 poin saran konkret untuk minggu depan.
        1. Apakah jadwal perlu dikurangi/ditambah?
        2. Apakah perlu ganti jenis latihan?
        3. Tips nutrisi/recovery singkat.
        """
        try:
            response = await self.model_info.generate_content_async(prompt)
            return response.text.strip()
        except:
            return "Tetap konsisten! Coba evaluasi lagi minggu depan."

    # --- FITUR CHAT (Main) ---

    async def process_chat(self, db: Session, user: User, message: str, mode: str):
        if mode == "action":
            return await self._handle_action_mode(db, user, message)
        else:
            return await self._handle_info_mode(user, message)

    async def _handle_info_mode(self, user: User, message: str):
        """
        Menangani Chat Biasa dengan Konteks User (Context-Aware).
        PROMPT INI DIPERTAHANKAN SESUAI PERMINTAANMU.
        """
        fitness_val = user.fitness_level.value if hasattr(user.fitness_level, 'value') else str(user.fitness_level)
        goal_val = user.main_goal.value if hasattr(user.main_goal, 'value') else str(user.main_goal)
        injury_list = [i.muscle_group.value if hasattr(i.muscle_group, 'value') else str(i.muscle_group) for i in user.injuries]
        injuries_str = ", ".join(injury_list) if injury_list else "Tidak ada cedera"

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
        
        prompt = f"""
        Tugas: Analisis perintah user dan panggil Tool yang tepat.
        
        Rules untuk Waktu Sibuk:
        - Jika user bilang "Sibuk", "Gak bisa", "Ada acara" -> action="set_busy"
        - Jika user bilang "Kosong", "Bisa", "Available", "Gak jadi sibuk", "Free" -> action="set_free"
        
        User: {message}
        """
        
        try:
            response = await chat.send_message_async(prompt)
            function_calls = self._get_function_calls(response)
            
            if function_calls:
                results = []
                for fc in function_calls:
                    # FIX: TAMBAHKAN AWAIT DISINI (Kunci perbaikan error coroutine)
                    res = await self._execute_function(fc, db, user)
                    results.append(res)
                return "\n".join(results)
            else:
                return "Maaf, saya tidak menangkap perintah data yang valid. Coba lebih spesifik."
                
        except Exception as e:
            return f"Error Aksi: {str(e)}"

    def _get_function_calls(self, response):
        try:
            parts = response.candidates[0].content.parts
            calls = []
            for part in parts:
                if part.function_call and part.function_call.name:
                    calls.append(part.function_call)
            return calls
        except:
            return []

    async def _execute_function(self, function_call, db, user):
        # FIX: Jadikan async def agar bisa await tool
        fn_name = function_call.name
        fn_args = function_call.args
        
        if fn_name in available_functions:
            func = available_functions[fn_name]
            try:
                # Dispatcher Logic dengan AWAIT
                if fn_name == "update_profile":
                    return await func(db, user, **dict(fn_args))
                elif fn_name == "manage_busy_time":
                    return await func(db, user, **dict(fn_args))
                elif fn_name == "log_workout":
                    return await func(db, user, fn_args["feedback"], int(fn_args["duration_minutes"]))
            except Exception as e:
                return f"Gagal eksekusi: {str(e)}"
        
        return "Fungsi tidak valid."

chat_service = ChatService()