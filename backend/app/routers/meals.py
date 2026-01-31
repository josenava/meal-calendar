from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Meal
from ..schemas import MealCopy, MealCreate, MealResponse, MealUpdate

router = APIRouter(prefix="/api/meals", tags=["meals"])


@router.get("/search", response_model=list[MealResponse])
def search_meals_by_ingredient(
    ingredient: str = Query(..., min_length=1, description="Ingredient to search for"),
    db: Session = Depends(get_db)
):
    """Search for meals containing a specific ingredient (exact match, case-insensitive)."""
    # Get meal IDs that contain the ingredient using json_each
    stmt = text("""
        SELECT DISTINCT m.id
        FROM meals m, json_each(m.ingredients) AS j
        WHERE LOWER(j.value) = LOWER(:ingredient)
        ORDER BY m.date DESC
        LIMIT 10
    """)
    result = db.execute(stmt, {"ingredient": ingredient.strip()})
    meal_ids = [row[0] for row in result.fetchall()]
    
    if not meal_ids:
        return []
    
    # Fetch full Meal objects using ORM for proper serialization
    meals = db.query(Meal).filter(Meal.id.in_(meal_ids)).all()
    # Re-sort by date descending since IN doesn't preserve order
    meals.sort(key=lambda m: m.date, reverse=True)
    return meals


@router.get("", response_model=list[MealResponse])
def get_meals(
    start_date: date = Query(..., description="Start date (inclusive)"),
    end_date: date = Query(..., description="End date (inclusive)"),
    db: Session = Depends(get_db)
):
    """Get all meals within a date range."""
    meals = db.query(Meal).filter(
        Meal.date >= start_date,
        Meal.date <= end_date
    ).order_by(Meal.date, Meal.meal_type).all()
    return meals


@router.post("", response_model=MealResponse, status_code=201)
def create_meal(meal: MealCreate, db: Session = Depends(get_db)):
    """Create a new meal."""
    db_meal = Meal(
        date=meal.date,
        meal_type=meal.meal_type,
        name=meal.name,
        ingredients=meal.ingredients
    )
    try:
        db.add(db_meal)
        db.commit()
        db.refresh(db_meal)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A meal already exists for {meal.date} - {meal.meal_type}"
        ) from None
    return db_meal


@router.put("/{meal_id}", response_model=MealResponse)
def update_meal(meal_id: int, meal: MealUpdate, db: Session = Depends(get_db)):
    """Update an existing meal."""
    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db_meal.name = meal.name
    db_meal.ingredients = meal.ingredients
    db.commit()
    db.refresh(db_meal)
    return db_meal


@router.delete("/{meal_id}", status_code=204)
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    """Delete a meal."""
    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db.delete(db_meal)
    db.commit()
    return None


@router.post("/{meal_id}/copy", response_model=MealResponse, status_code=201)
def copy_meal(meal_id: int, copy_data: MealCopy, db: Session = Depends(get_db)):
    """Copy an existing meal to a different date and/or meal type."""
    source_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not source_meal:
        raise HTTPException(status_code=404, detail="Source meal not found")
    
    new_meal = Meal(
        date=copy_data.target_date,
        meal_type=copy_data.target_meal_type,
        name=source_meal.name,
        ingredients=source_meal.ingredients or []
    )
    
    try:
        db.add(new_meal)
        db.commit()
        db.refresh(new_meal)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A meal already exists for {copy_data.target_date} - "
            f"{copy_data.target_meal_type}",
        ) from None

    return new_meal
