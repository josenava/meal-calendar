from datetime import date
from typing import List
from uuid import UUID

from app.auth.endpoints import get_current_user
from app.database import get_db
from app.users.models import User
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .exceptions import ActionNotAllowed, MealAlreadyExists, MealNotFound
from .factories import (build_create_meal_service, build_delete_meal_service,
                        build_get_meals_service, build_update_meal_service)
from .requests import CreateMealRequest, UpdateMealRequest
from .responses import Meal

router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK, response_model=List[Meal])
def get_meals(
        start_date: date,
        end_date: date,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    if start_date > end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Start date is greater than end_date {start_date=}, {end_date=}")
    service = build_get_meals_service(db)
    meals = service.execute(current_user.id, start_date, end_date)

    return meals


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Meal)
def create_meal(
        meal_request: CreateMealRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    service = build_create_meal_service(db)
    try:
        meal = service.execute(meal_request, current_user)
    except MealAlreadyExists:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    return meal


@router.put("/{meal_id}", status_code=status.HTTP_200_OK)
def update_meal(
        meal_id: UUID,
        meal_request: UpdateMealRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    service = build_update_meal_service(db)
    try:
        service.execute(meal_request, current_user.id)
    except MealNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except ActionNotAllowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    return {'id': meal_id}


@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(
        meal_id: UUID,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    service = build_delete_meal_service(db)
    try:
        service.execute(meal_id, current_user.id)
    except MealNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except ActionNotAllowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {}
