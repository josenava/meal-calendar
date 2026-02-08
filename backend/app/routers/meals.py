from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Meal
from ..schemas import MealCopy, MealCreate, MealMove, MealResponse, MealSwap, MealUpdate

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
    
    db_meal.date = meal.date
    db_meal.meal_type = meal.meal_type
    db_meal.name = meal.name
    db_meal.ingredients = meal.ingredients
    
    try:
        db.commit()
        db.refresh(db_meal)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"A meal already exists for {meal.date} - {meal.meal_type}"
        ) from None
        
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


@router.post("/swap", response_model=list[MealResponse])
def swap_meals(swap_data: MealSwap, db: Session = Depends(get_db)):
    """Swap dates and meal types between two meals."""
    if swap_data.meal_id_1 == swap_data.meal_id_2:
        raise HTTPException(
            status_code=400,
            detail="Cannot swap a meal with itself"
        )

    meal_1 = db.query(Meal).filter(Meal.id == swap_data.meal_id_1).first()
    meal_2 = db.query(Meal).filter(Meal.id == swap_data.meal_id_2).first()

    if not meal_1:
        raise HTTPException(
            status_code=404,
            detail=f"Meal with id {swap_data.meal_id_1} not found"
        )
    if not meal_2:
        raise HTTPException(
            status_code=404,
            detail=f"Meal with id {swap_data.meal_id_2} not found"
        )

    # Swap names and ingredients (content stays in original slots)
    meal_1.name, meal_2.name = meal_2.name, meal_1.name
    meal_1.ingredients, meal_2.ingredients = meal_2.ingredients, meal_1.ingredients

    db.commit()
    db.refresh(meal_1)
    db.refresh(meal_2)

    return [meal_1, meal_2]


@router.patch("/{meal_id}/move", response_model=MealResponse)
def move_meal(meal_id: int, move_data: MealMove, db: Session = Depends(get_db)):
    """Move a meal to a different date and/or meal type."""
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    # Check if target slot is already occupied
    existing = db.query(Meal).filter(
        Meal.date == move_data.target_date,
        Meal.meal_type == move_data.target_meal_type
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"A meal already exists for {move_data.target_date} - {move_data.target_meal_type}"
        )

    # Move the meal to the new slot
    meal.date = move_data.target_date
    meal.meal_type = move_data.target_meal_type

    db.commit()
    db.refresh(meal)

    return meal
