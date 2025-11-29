from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, Boolean, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Data Fisik & Preferensi
    weight_kg = Column(Float)
    height_cm = Column(Integer)
    fitness_level = Column(Enum('Beginner', 'Intermediate', 'Advanced', 'Athlete'))
    main_goal = Column(Enum('Fat Loss', 'Muscle Gain', 'Stay Healthy', 'Flexibility'))
    location_preference = Column(Enum('Home', 'Gym'))
    target_sessions_per_week = Column(Integer, default=3)
    preferred_duration_minutes = Column(Integer, default=45)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relasi (One-to-Many)
    busy_times = relationship("UserBusyTime", back_populates="user", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="user")


class UserBusyTime(Base):
    __tablename__ = "user_busy_times"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    day_of_week = Column(Enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
    start_time = Column(Time, nullable=True) # Bisa null jika full day
    end_time = Column(Time, nullable=True)
    is_full_day = Column(Boolean, default=False)

    user = relationship("User", back_populates="busy_times")