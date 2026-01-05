"""
Habit Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_
from typing import List, Optional
from app.models.user import User
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models.habit import Habit
from app.models.habit_check import HabitCheck
from app.models.user import User
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class HabitCreate(BaseModel):
    name: str
    color: str = "#6366f1"
    icon: Optional[str] = None
    category: Optional[str] = None

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    category: Optional[str] = None

class HabitCheckCreate(BaseModel):
    habit_id: str
    date: date
    completed: bool = True

@router.get("/habits")
async def get_habits(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get all habits for the current user"""
    query = db.query(Habit)
    if current_user:
        query = query.filter(Habit.user_id == current_user.id)
    else:
        # For backward compatibility, allow null user_id
        query = query.filter(Habit.user_id == None)
    if active_only:
        query = query.filter(Habit.is_active == True)
    habits = query.order_by(Habit.created_at.desc()).all()
    return {"habits": [habit.to_dict() for habit in habits]}

@router.post("/habits")
async def create_habit(
    habit_data: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new habit"""
    habit = Habit(
        user_id=current_user.id,
        name=habit_data.name,
        color=habit_data.color,
        icon=habit_data.icon,
        category=habit_data.category,
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return {"habit": habit.to_dict()}

@router.get("/habits/{habit_id}")
async def get_habit(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific habit"""
    query = db.query(Habit).filter(Habit.id == habit_id)
    if current_user:
        query = query.filter(Habit.user_id == current_user.id)
    habit = query.first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"habit": habit.to_dict()}

@router.put("/habits/{habit_id}")
async def update_habit(
    habit_id: str,
    habit_data: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Update a habit"""
    query = db.query(Habit).filter(Habit.id == habit_id)
    if current_user:
        query = query.filter(Habit.user_id == current_user.id)
    habit = query.first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    if habit_data.name is not None:
        habit.name = habit_data.name
    if habit_data.color is not None:
        habit.color = habit_data.color
    if habit_data.icon is not None:
        habit.icon = habit_data.icon
    if habit_data.is_active is not None:
        habit.is_active = habit_data.is_active
    if habit_data.category is not None:
        habit.category = habit_data.category
    
    db.commit()
    db.refresh(habit)
    return {"habit": habit.to_dict()}

@router.delete("/habits/{habit_id}")
async def delete_habit(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Delete a habit"""
    query = db.query(Habit).filter(Habit.id == habit_id)
    if current_user:
        query = query.filter(Habit.user_id == current_user.id)
    habit = query.first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Delete related habit checks
    check_query = db.query(HabitCheck).filter(HabitCheck.habit_id == habit_id)
    if current_user:
        check_query = check_query.filter(HabitCheck.user_id == current_user.id)
    check_query.delete()
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted successfully"}

@router.get("/habits/{habit_id}/checks")
async def get_habit_checks(
    habit_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get habit checks for a habit"""
    query = db.query(HabitCheck).filter(HabitCheck.habit_id == habit_id)
    
    if start_date:
        query = query.filter(HabitCheck.date >= start_date)
    if end_date:
        query = query.filter(HabitCheck.date <= end_date)
    
    checks = query.order_by(HabitCheck.date.desc()).all()
    return {"checks": [check.to_dict() for check in checks]}

@router.post("/habits/checks")
async def create_habit_check(
    check_data: HabitCheckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update a habit check"""
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        and_(Habit.id == check_data.habit_id, Habit.user_id == current_user.id)
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Check if already exists
    existing = db.query(HabitCheck).filter(
        and_(
            HabitCheck.habit_id == check_data.habit_id,
            HabitCheck.date == check_data.date,
            HabitCheck.user_id == current_user.id
        )
    ).first()
    
    if existing:
        existing.completed = check_data.completed
        db.commit()
        db.refresh(existing)
        return {"check": existing.to_dict()}
    else:
        check = HabitCheck(
            user_id=current_user.id,
            habit_id=check_data.habit_id,
            date=check_data.date,
            completed=check_data.completed,
        )
        db.add(check)
        db.commit()
        db.refresh(check)
        return {"check": check.to_dict()}

@router.get("/habits/checks/date/{check_date}")
async def get_checks_for_date(
    check_date: date,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get all habit checks for a specific date"""
    query = db.query(HabitCheck).filter(HabitCheck.date == check_date)
    if current_user:
        query = query.filter(HabitCheck.user_id == current_user.id)
    checks = query.all()
    return {"checks": [check.to_dict() for check in checks]}

@router.get("/habits/{habit_id}/streak")
async def get_habit_streak(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get streak information for a habit"""
    # Verify habit belongs to user
    habit_query = db.query(Habit).filter(Habit.id == habit_id)
    if current_user:
        habit_query = habit_query.filter(Habit.user_id == current_user.id)
    habit = habit_query.first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Get all completed checks, ordered by date descending
    query = db.query(HabitCheck).filter(
        and_(
            HabitCheck.habit_id == habit_id,
            HabitCheck.completed == True
        )
    )
    if current_user:
        query = query.filter(HabitCheck.user_id == current_user.id)
    checks = query.order_by(HabitCheck.date.desc()).all()
    
    if not checks:
        return {
            "habitId": habit_id,
            "currentStreak": 0,
            "longestStreak": 0,
        }
    
    # Calculate current streak
    today = date.today()
    current_streak = 0
    expected_date = today
    
    for check in checks:
        if check.date == expected_date:
            current_streak += 1
            expected_date = expected_date - timedelta(days=1)
        else:
            break
    
    # Calculate longest streak
    longest_streak = 1
    temp_streak = 1
    sorted_dates = sorted([c.date for c in checks])
    
    for i in range(1, len(sorted_dates)):
        if sorted_dates[i] - sorted_dates[i-1] == timedelta(days=1):
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1
    
    return {
        "habitId": habit_id,
        "currentStreak": current_streak,
        "longestStreak": longest_streak,
        "lastCompletedDate": checks[0].date.isoformat() if checks else None,
    }


