from app.users.models import User

from .exceptions import MealAlreadyExists
from .models import Meal
from .repositories import MealRepository
from .requests import CreateMealRequest


class CreateMealService:
    def __init__(self, meal_repository: MealRepository):
        self._meal_repository = meal_repository

    def execute(self, meal_request: CreateMealRequest, user: User) -> Meal:
        meal = Meal.create(
            type=meal_request.type,
            title=meal_request.title,
            date=meal_request.date,
            user_id=user.id
        )
        try:
            self._meal_repository.save(meal)
        except MealAlreadyExists as e:
            raise e

        return meal
