"""
Habit model
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.models.base import Base
import uuid

class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)  # Will be required after migration
    name = Column(String, nullable=False)
    color = Column(String, default="#6366f1")
    icon = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "icon": self.icon,
            "isActive": self.is_active,
            "category": self.category,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


