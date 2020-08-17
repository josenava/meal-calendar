from typing import List
from datetime import date
from uuid import UUID
from app.users.models import User

from .exceptions import ActionNotAllowed, MealAlreadyExists, MealNotFound
from .models import Meal
from .repositories import MealRepository
from .requests import CreateMealRequest, UpdateMealRequest


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


class UpdateMealService:
    def __init__(self, meal_repository: MealRepository):
        self._meal_repository = meal_repository

    def execute(self, meal_request: UpdateMealRequest, user_id: int) -> Meal:
        meal = self._meal_repository.get_by_id(meal_request.id)
        if meal is None:
            raise MealNotFound

        if meal.user_id != user_id:
            raise ActionNotAllowed

        meal.type = meal_request.type
        meal.title = meal_request.title

        self._meal_repository.save(meal, is_update=True)


class DeleteMealService:
    def __init__(self, meal_repository: MealRepository):
        self._meal_repository = meal_repository

    def execute(self, meal_id: UUID, user_id: int):
        meal = self._meal_repository.get_by_id(meal_id)
        if meal is None:
            raise MealNotFound

        if meal.user_id != user_id:
            raise ActionNotAllowed

        self._meal_repository.delete(meal)


class GetMealsService:
    def __init__(self, meal_repository: MealRepository):
        self._meal_repository = meal_repository

    def execute(self, user_id: int, start_date: date, end_date: date) -> List[Meal]:
        meals = self._meal_repository.get_by_user_id_and_date(user_id, start_date, end_date)

        return meals
