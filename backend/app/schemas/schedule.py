from pydantic import BaseModel
from typing import List

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
