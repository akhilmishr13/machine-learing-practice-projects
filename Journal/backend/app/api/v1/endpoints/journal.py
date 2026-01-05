"""
Journal Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.journal_entry import JournalEntry
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class CanvasLayer(BaseModel):
    id: str
    type: str
    x: float
    y: float
    width: float
    height: float
    rotation: float
    scale: float
    zIndex: int
    data: dict

class JournalEntryCreate(BaseModel):
    date: date
    text: Optional[str] = None
    layers: List[CanvasLayer] = []
    background: Optional[str] = None

class JournalEntryUpdate(BaseModel):
    text: Optional[str] = None
    layers: Optional[List[CanvasLayer]] = None
    background: Optional[str] = None

class DailyLogUpdate(BaseModel):
    text: str

@router.get("/entries")
async def get_journal_entries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get journal entries for a date range"""
    query = db.query(JournalEntry)
    if current_user:
        query = query.filter(JournalEntry.user_id == current_user.id)
    else:
        query = query.filter(JournalEntry.user_id == None)
    
    if start_date:
        query = query.filter(JournalEntry.date >= start_date)
    if end_date:
        query = query.filter(JournalEntry.date <= end_date)
    
    entries = query.order_by(JournalEntry.date.desc()).all()
    return {"entries": [entry.to_dict() for entry in entries]}

@router.post("/entries")
async def create_journal_entry(
    entry_data: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new journal entry"""
    # Check if entry already exists for this date
    existing = db.query(JournalEntry).filter(
        and_(
            JournalEntry.date == entry_data.date,
            JournalEntry.user_id == current_user.id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Entry already exists for this date")
    
    entry = JournalEntry(
        user_id=current_user.id,
        date=entry_data.date,
        text=entry_data.text,
        layers=[layer.dict() for layer in entry_data.layers],
        background=entry_data.background,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"entry": entry.to_dict()}

@router.get("/entries/{entry_date}")
async def get_journal_entry(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific journal entry by date"""
    query = db.query(JournalEntry).filter(JournalEntry.date == entry_date)
    if current_user:
        query = query.filter(JournalEntry.user_id == current_user.id)
    entry = query.first()
    if not entry:
        return {"entry": None}
    return {"entry": entry.to_dict()}

@router.put("/entries/{entry_date}")
async def update_journal_entry(
    entry_date: date,
    entry_data: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Update a journal entry"""
    query = db.query(JournalEntry).filter(JournalEntry.date == entry_date)
    if current_user:
        query = query.filter(JournalEntry.user_id == current_user.id)
    entry = query.first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    if entry_data.text is not None:
        entry.text = entry_data.text
    if entry_data.layers is not None:
        entry.layers = [layer.dict() for layer in entry_data.layers]
    if entry_data.background is not None:
        entry.background = entry_data.background
    
    db.commit()
    db.refresh(entry)
    return {"entry": entry.to_dict()}

@router.delete("/entries/{entry_date}")
async def delete_journal_entry(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Delete a journal entry"""
    query = db.query(JournalEntry).filter(JournalEntry.date == entry_date)
    if current_user:
        query = query.filter(JournalEntry.user_id == current_user.id)
    entry = query.first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted successfully"}

@router.post("/entries/{entry_date}/daily-log")
async def update_daily_log(
    entry_date: date,
    log_data: DailyLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update daily log text for an entry"""
    entry = db.query(JournalEntry).filter(
        and_(
            JournalEntry.date == entry_date,
            JournalEntry.user_id == current_user.id
        )
    ).first()
    if not entry:
        # Create entry if it doesn't exist
        entry = JournalEntry(
            user_id=current_user.id,
            date=entry_date,
            text=log_data.text,
            layers=[]
        )
        db.add(entry)
    else:
        entry.text = log_data.text
    
    db.commit()
    db.refresh(entry)
    return {"entry": entry.to_dict()}
