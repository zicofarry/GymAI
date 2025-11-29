from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- Input untuk Register & Login ---
class UserCreate(BaseModel):
    username: str
    email: EmailStr  # Memastikan format email valid (@gmail.com dll)
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Input untuk Generate Schedule (Profile Wizard) ---
class BusyTimeInput(BaseModel):
    day: str
    is_full_day: bool
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class UserProfileInput(BaseModel):
    weight: float
    height: int
    fitness_level: str 
    goal: str
    location: str
    sessions_per_week: int
    busy_times: List[BusyTimeInput]
    preferred_workout_time: str = "Anytime" # Morning, Afternoon, Evening, Night
    injuries: List[str] = [] # List otot yang cedera, misal ["Shoulders", "Knees"]

class UserStats(BaseModel):
    total_workouts: int
    total_minutes: int
    total_calories: int
    streak_days: int  # Bonus: Hitung hari berturut-turut (dummy/logic)

class UserActivityLog(BaseModel):
    id: int
    date: str
    exercise_name: str
    duration: int
    calories: int
    rating: Optional[int] = None

class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    
    # Data Fisik
    weight: float
    height: int
    fitness_level: str
    goal: str
    location: str
    
    # Stats Tracker
    stats: UserStats
    recent_activity: List[UserActivityLog]
    weekly_report_text: str = "Belum ada laporan minggu ini."