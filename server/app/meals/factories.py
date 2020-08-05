from sqlalchemy.orm import Session

from .repositories import MealRepository
from .services import CreateMealService, UpdateMealService, DeleteMealService


def build_create_meal_service(db: Session) -> CreateMealService:
    return CreateMealService(MealRepository(db))


def build_update_meal_service(db: Session) -> UpdateMealService:
    return UpdateMealService(MealRepository(db))


def build_delete_meal_service(db: Session) -> DeleteMealService:
    return DeleteMealService(MealRepository(db))
