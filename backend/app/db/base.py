# Import Base class
from app.db.base_class import Base

# Nanti kita akan import model-model di sini
# Contoh (jangan dijalankan dulu karena filenya belum ada):
from app.models.user import User, UserBusyTime
from app.models.exercise import Exercise
from app.models.schedule import Schedule, ScheduleItem
from app.models.log import UserLog