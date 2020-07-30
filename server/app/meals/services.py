from app.users.models import User

from .models import Meal
from .repositories import MealRepository
from .requests import CreateMealRequest


class CreateMealService:
    def __init__(self, meal_repository: MealRepository):
        self._meal_repository = meal_repository

    def execute(self, meal_request: CreateMealRequest, user: User) -> Meal:
        return Meal()
