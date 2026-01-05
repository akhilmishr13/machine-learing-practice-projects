"""
Journal entry model
"""
from sqlalchemy import Column, String, Text, Date, JSON, DateTime
from sqlalchemy.sql import func
from app.models.base import Base
import uuid

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)  # Will be required after migration
    date = Column(Date, nullable=False)
    text = Column(Text, nullable=True)  # Daily log text
    layers = Column(JSON, nullable=False, default=list)  # Canvas layers
    background = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.isoformat() if self.date else None,
            "text": self.text,
            "layers": self.layers,
            "background": self.background,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


