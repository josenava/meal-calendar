from sqlalchemy.orm import Session

from .repositories import MealRepository
from .services import CreateMealService


def build_create_meal_service(db: Session) -> CreateMealService:
    return CreateMealService(MealRepository(db))
