from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class UserLog(Base):
    __tablename__ = "user_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    schedule_item_id = Column(Integer, ForeignKey("schedule_items.id"), nullable=True)
    
    # Waktu penyelesaian (otomatis terisi saat di-insert)
    log_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Data Realisasi Latihan
    actual_duration_minutes = Column(Integer) # Berapa lama user beneran latihan
    calories_burned = Column(Integer)         # Estimasi kalori
    rating = Column(Integer)                  # Rating sesi (1-5)
    feedback_text = Column(Text)              # Catatan user: "Capek", "Seru", dll.

    # Relasi
    user = relationship("app.models.user.User")
    schedule_item = relationship("app.models.schedule.ScheduleItem")
