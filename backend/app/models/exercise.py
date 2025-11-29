from sqlalchemy import Column, Integer, String, Enum, Text
from app.db.base_class import Base

class Exercise(Base):
    __tablename__ = "exercise_library"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(Enum('Strength', 'Cardio', 'Flexibility', 'HIIT'))
    muscle_group = Column(Enum('Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio'))
    equipment_type = Column(Enum('None', 'Dumbbell', 'Barbell', 'Machine', 'Resistance Band'))
    difficulty_level = Column(Enum('Beginner', 'Intermediate', 'Advanced'))
    
    # Durasi total estimasi (termasuk istirahat)
    default_duration_minutes = Column(Integer) 
    calories_burn_estimate = Column(Integer) # Kalori per sesi standar
    description = Column(Text)
    
    # BARU: Detail Teknis Default
    default_sets = Column(Integer, default=3)
    default_reps = Column(String(50), default="10-12") # String karena bisa "12" atau "30 sec"
    rest_seconds = Column(Integer, default=60)