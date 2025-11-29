from pydantic import BaseModel
from typing import List, Optional

# Input Schema (Data yang dikirim dari Frontend React)
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    
class BusyTimeInput(BaseModel):
    day: str
    is_full_day: bool
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class UserProfileInput(BaseModel):
    # Kita tidak mengirim password/email di sini karena ini konteksnya "Generate Schedule"
    # Asumsi user sudah login atau ini form wizard awal
    weight: float
    height: int
    fitness_level: str 
    goal: str
    location: str
    sessions_per_week: int
    busy_times: List[BusyTimeInput]

# Output Schema (Data yang dikirim balik ke Frontend)
class ScheduleItemResponse(BaseModel):
    day: str
    exercise_name: str
    time: str
    duration: int
    muscle_group: str
    tips: str

class ScheduleResponse(BaseModel):
    motivation: str
    schedule: List[ScheduleItemResponse]
