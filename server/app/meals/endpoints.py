from uuid import UUID
from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.endpoints import get_current_user
from app.users.models import User

from .exceptions import MealAlreadyExists
from .factories import build_create_meal_service
from .requests import CreateMealRequest
from .responses import Meal


router = APIRouter()


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


@router.put("/{meal_id}")
def update_meal(
        meal_id: UUID,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    return {'id': meal_id}
