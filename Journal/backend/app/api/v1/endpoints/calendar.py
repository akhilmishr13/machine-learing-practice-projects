"""
Calendar Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.event import Event
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: str = "#6366f1"
    synced_calendars: Optional[List[str]] = None
    notion_page_id: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: Optional[str] = None
    synced_calendars: Optional[List[str]] = None
    notion_page_id: Optional[str] = None

@router.get("/events")
async def get_events(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get calendar events for a date range"""
    query = db.query(Event)
    if current_user:
        query = query.filter(Event.user_id == current_user.id)
    else:
        query = query.filter(Event.user_id == None)
    
    if start_date:
        query = query.filter(Event.date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(Event.date <= datetime.combine(end_date, datetime.max.time()))
    
    events = query.order_by(Event.date.asc()).all()
    return {"events": [event.to_dict() for event in events]}

@router.post("/events")
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new calendar event"""
    event = Event(
        user_id=current_user.id,
        title=event_data.title,
        description=event_data.description,
        date=event_data.date,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        color=event_data.color,
        synced_calendars=event_data.synced_calendars,
        notion_page_id=event_data.notion_page_id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"event": event.to_dict()}

@router.get("/events/{event_id}")
async def get_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific calendar event"""
    query = db.query(Event).filter(Event.id == event_id)
    if current_user:
        query = query.filter(Event.user_id == current_user.id)
    event = query.first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"event": event.to_dict()}

@router.put("/events/{event_id}")
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Update a calendar event"""
    query = db.query(Event).filter(Event.id == event_id)
    if current_user:
        query = query.filter(Event.user_id == current_user.id)
    event = query.first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event_data.title is not None:
        event.title = event_data.title
    if event_data.description is not None:
        event.description = event_data.description
    if event_data.date is not None:
        event.date = event_data.date
    if event_data.start_time is not None:
        event.start_time = event_data.start_time
    if event_data.end_time is not None:
        event.end_time = event_data.end_time
    if event_data.color is not None:
        event.color = event_data.color
    if event_data.synced_calendars is not None:
        event.synced_calendars = event_data.synced_calendars
    if event_data.notion_page_id is not None:
        event.notion_page_id = event_data.notion_page_id
    
    db.commit()
    db.refresh(event)
    return {"event": event.to_dict()}

@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Delete a calendar event"""
    query = db.query(Event).filter(Event.id == event_id)
    if current_user:
        query = query.filter(Event.user_id == current_user.id)
    event = query.first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

@router.get("/events/date/{event_date}")
async def get_events_for_date(
    event_date: date,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get all events for a specific date"""
    start_datetime = datetime.combine(event_date, datetime.min.time())
    end_datetime = datetime.combine(event_date, datetime.max.time())
    
    query = db.query(Event).filter(
        Event.date >= start_datetime,
        Event.date <= end_datetime
    )
    if current_user:
        query = query.filter(Event.user_id == current_user.id)
    else:
        query = query.filter(Event.user_id == None)
    
    events = query.order_by(Event.date.asc()).all()
    return {"events": [event.to_dict() for event in events]}
