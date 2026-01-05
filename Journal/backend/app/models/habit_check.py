"""
Habit check model
"""
from sqlalchemy import Column, String, Boolean, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid

class HabitCheck(Base):
    __tablename__ = "habit_checks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)  # Will be required after migration
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    habit = relationship("Habit", backref="checks")

    def to_dict(self):
        return {
            "id": self.id,
            "habitId": self.habit_id,
            "date": self.date.isoformat() if self.date else None,
            "completed": self.completed,
        }


