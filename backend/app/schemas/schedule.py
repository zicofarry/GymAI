from pydantic import BaseModel
from typing import List

class ScheduleItemResponse(BaseModel):
    id: int
    day: str
    exercise_name: str
    time: str
    duration: int
    muscle_group: str
    tips: str
    is_completed: bool
    
    # BARU: Detail Latihan
    sets: int
    reps: str
    rest: int
    calories: int

class ScheduleResponse(BaseModel):
    motivation: str
    schedule: List[ScheduleItemResponse]