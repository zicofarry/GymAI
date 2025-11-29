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
