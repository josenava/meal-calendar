from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.endpoints import get_current_user
from app.users.models import User

from .requests import CreateMealRequest


router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_meal(
        meal_request: CreateMealRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    return {}
