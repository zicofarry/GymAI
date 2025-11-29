from sqlalchemy import Column, Integer, Boolean, Enum, Time, ForeignKey, Date, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    start_date = Column(Date)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    ai_weekly_motivation = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relasi
    user = relationship("app.models.user.User", back_populates="schedules")
    items = relationship("ScheduleItem", back_populates="schedule", cascade="all, delete-orphan")

class ScheduleItem(Base):
    __tablename__ = "schedule_items"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"))
    exercise_id = Column(Integer, ForeignKey("exercise_library.id"))
    
    day_of_week = Column(Enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
    scheduled_time = Column(Time)
    duration_minutes = Column(Integer)
    is_completed = Column(Boolean, default=False)
    ai_custom_tips = Column(Text)
    
    # Relasi
    schedule = relationship("Schedule", back_populates="items")
    exercise = relationship("app.models.exercise.Exercise")
