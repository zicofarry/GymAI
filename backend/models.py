from sqlalchemy import Column, Integer, String, Float, Boolean, Enum, Time, ForeignKey, Date, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    weight_kg = Column(Float)
    height_cm = Column(Integer)
    fitness_level = Column(Enum('Beginner', 'Intermediate', 'Advanced', 'Athlete'))
    main_goal = Column(Enum('Fat Loss', 'Muscle Gain', 'Stay Healthy', 'Flexibility'))
    location_preference = Column(Enum('Home', 'Gym'))
    target_sessions_per_week = Column(Integer, default=3)
    preferred_duration_minutes = Column(Integer, default=45)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Exercise(Base):
    __tablename__ = "exercise_library"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    category = Column(Enum('Strength', 'Cardio', 'Flexibility', 'HIIT'))
    muscle_group = Column(Enum('Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Cardio'))
    equipment_type = Column(Enum('None', 'Dumbbell', 'Barbell', 'Machine', 'Resistance Band'))
    difficulty_level = Column(Enum('Beginner', 'Intermediate', 'Advanced'))
    default_duration_minutes = Column(Integer)
    calories_burn_estimate = Column(Integer)
    description = Column(Text)

class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    ai_weekly_motivation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    items = relationship("ScheduleItem", back_populates="schedule")

class ScheduleItem(Base):
    __tablename__ = "schedule_items"
    id = Column(Integer, primary_key=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"))
    exercise_id = Column(Integer, ForeignKey("exercise_library.id"))
    day_of_week = Column(Enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
    scheduled_time = Column(Time)
    duration_minutes = Column(Integer)
    is_completed = Column(Boolean, default=False)
    ai_custom_tips = Column(Text)
    
    exercise = relationship("Exercise")
    schedule = relationship("Schedule", back_populates="items")
