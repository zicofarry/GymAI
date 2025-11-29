import google.generativeai as genai
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User, UserBusyTime
from app.models.log import UserLog
from datetime import datetime

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
    """Mengupdate data profil fisik dan preferensi user secara fleksibel."""
    changes = []
    
    if weight is not None:
        user.weight_kg = weight
        changes.append(f"Berat: {weight}kg")
    
    if height is not None:
        user.height_cm = height
        changes.append(f"Tinggi: {height}cm")
        
    if goal is not None:
        # Mapping input AI ke Enum Database (jika perlu)
        user.main_goal = goal
        changes.append(f"Goal: {goal}")
        
    if level is not None:
        user.fitness_level = level
        changes.append(f"Level: {level}")
        
    if location is not None:
        user.location_preference = location
        changes.append(f"Lokasi: {location}")
        
    if sessions is not None:
        user.target_sessions_per_week = sessions
        changes.append(f"Sesi/minggu: {sessions}x")

    db.commit()
    return f"SUKSES: Profil berhasil diupdate ({', '.join(changes)})."

def tool_add_busy_time(db: Session, user: User, day: str, start_time: str = None, end_time: str = None, is_full_day: bool = False):
    """Menambahkan jadwal sibuk baru ke database."""
    # Konversi string jam "08:00" ke object Time atau simpan string jika DB support
    # Di sini kita simpan apa adanya, SQLAlchemy akan handle casting jika format benar (HH:MM:SS)
    
    new_busy = UserBusyTime(
        user_id=user.id,
        day_of_week=day,
        is_full_day=is_full_day,
        start_time=start_time + ":00" if start_time else None,
        end_time=end_time + ":00" if end_time else None
    )
    db.add(new_busy)
    db.commit()
    
    time_info = "seharian" if is_full_day else f"jam {start_time}-{end_time}"
    return f"SUKSES: Jadwal sibuk hari {day} ({time_info}) berhasil ditambahkan."

def tool_log_workout(db: Session, user: User, feedback: str, duration_minutes: int):
    """Mencatat log latihan."""
    new_log = UserLog(
        user_id=user.id,
        actual_duration_minutes=duration_minutes,
        feedback_text=feedback,
        rating=5, 
        log_date=datetime.now()
    )
    db.add(new_log)
    db.commit()
    return "SUKSES: Log latihan berhasil disimpan."

# Mapping Nama Fungsi -> Fungsi Python
available_functions = {
    "update_profile": tool_update_profile,
    "add_busy_time": tool_add_busy_time,
    "log_workout": tool_log_workout
}

# ==========================================
# 2. CHAT ENGINE
# ==========================================

class ChatService:
    def __init__(self):
        # Definisikan Schema Tools agar AI tahu cara pakainya
        self.tools_schema = [
            {
                "function_declarations": [
                    {
                        "name": "update_profile",
                        "description": "Gunakan tool ini untuk mengubah data fisik atau preferensi user (berat, tinggi, goal, level, lokasi, jumlah sesi).",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "weight": {"type": "NUMBER", "description": "Berat badan (kg)"},
                                "height": {"type": "INTEGER", "description": "Tinggi badan (cm)"},
                                "goal": {
                                    "type": "STRING", 
                                    "description": "Main Goal. Valid values: 'Fat Loss', 'Muscle Gain', 'Stay Healthy', 'Flexibility'"
                                },
                                "level": {
                                    "type": "STRING", 
                                    "description": "Fitness Level. Valid values: 'Beginner', 'Intermediate', 'Advanced', 'Athlete'"
                                },
                                "location": {
                                    "type": "STRING", 
                                    "description": "Location Preference. Valid values: 'Home', 'Gym'"
                                },
                                "sessions": {"type": "INTEGER", "description": "Target sesi latihan per minggu (misal 3, 4, 5)"}
                            }
                        }
                    },
                    {
                        "name": "add_busy_time",
                        "description": "Gunakan tool ini jika user bilang sibuk pada hari tertentu.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "day": {
                                    "type": "STRING", 
                                    "description": "Hari (English). Valid: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
                                },
                                "start_time": {"type": "STRING", "description": "Jam mulai sibuk (Format HH:MM, contoh 09:00)"},
                                "end_time": {"type": "STRING", "description": "Jam selesai sibuk (Format HH:MM, contoh 17:00)"},
                                "is_full_day": {"type": "BOOLEAN", "description": "True jika sibuk seharian, False jika hanya jam tertentu"}
                            },
                            "required": ["day"]
                        }
                    },
                    {
                        "name": "log_workout",
                        "description": "Gunakan tool ini jika user melapor SUDAH SELESAI latihan.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "feedback": {"type": "STRING", "description": "Kesan pesan user"},
                                "duration_minutes": {"type": "INTEGER", "description": "Durasi latihan (menit)"}
                            },
                            "required": ["feedback", "duration_minutes"]
                        }
                    }
                ]
            }
        ]
        
        # Init Model
        self.model_info = genai.GenerativeModel('gemini-2.0-flash')
        self.model_action = genai.GenerativeModel(
            model_name='gemini-2.0-flash', 
            tools=self.tools_schema
        )

    async def process_chat(self, db: Session, user: User, message: str, mode: str):
        """Router utama"""
        if mode == "action":
            return await self._handle_action_mode(db, user, message)
        else:
            return await self._handle_info_mode(user, message)

    async def _handle_info_mode(self, user: User, message: str):
        prompt = f"""
        Kamu adalah pelatih GymAI. User: {user.username}.
        Jawab pertanyaan user seputar fitness dengan ramah.
        User: {message}
        """
        try:
            response = await self.model_info.generate_content_async(prompt)
            return response.text
        except Exception as e:
            return f"Error Info: {str(e)}"

    async def _handle_action_mode(self, db: Session, user: User, message: str):
        chat = self.model_action.start_chat(enable_automatic_function_calling=False)
        prompt = f"""
        Tugas: Terjemahkan perintah user menjadi function call (Tool).
        Fokus ekstrak data secara akurat.
        User: {message}
        """
        
        try:
            response = await chat.send_message_async(prompt)
            function_call = self._get_function_call(response)
            
            if function_call:
                return self._execute_function(function_call, db, user)
            else:
                return "Maaf, perintah tidak dikenali atau data kurang lengkap untuk update."
                
        except Exception as e:
            return f"Error Aksi: {str(e)}"

    def _get_function_call(self, response):
        try:
            part = response.candidates[0].content.parts[0]
            if part.function_call and part.function_call.name:
                return part.function_call
            return None
        except:
            return None

    def _execute_function(self, function_call, db, user):
        fn_name = function_call.name
        fn_args = function_call.args
        
        if fn_name in available_functions:
            func = available_functions[fn_name]
            try:
                # Dispatcher Logic
                if fn_name == "update_profile":
                    # Mengirim argumen secara dinamis (kwargs)
                    # Kita cast fn_args ke dict agar aman
                    return func(db, user, **dict(fn_args))
                
                elif fn_name == "add_busy_time":
                    return func(db, user, **dict(fn_args))
                    
                elif fn_name == "log_workout":
                    return func(db, user, fn_args["feedback"], int(fn_args["duration_minutes"]))
                    
            except Exception as e:
                return f"Gagal update database: {str(e)}"
        
        return "Fungsi tidak valid."

chat_service = ChatService()