from datetime import date
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .exceptions import MealAlreadyExists
from .models import Meal


class MealRepository:
    def __init__(self, db_session: Session):
        self._db_session = db_session

    def get_by_id(self, meal_id: UUID) -> Optional[Meal]:
        return self._db_session.query(Meal).get(meal_id)

    def get_by_user_id_and_date(self, user_id: int, start_date: date, end_date: date) -> List[Meal]:
        return self._db_session.query(Meal).filter(
            Meal.user_id == user_id,
            Meal.date >= start_date, Meal.date <= end_date,
        ).all()

    def save(self, meal: Meal, is_update: bool = False):
        try:
            if not is_update:
                self._db_session.add(meal)
            self._db_session.commit()
        except IntegrityError:
            raise MealAlreadyExists

    def delete(self, meal: Meal):
        self._db_session.delete(meal)
        self._db_session.commit()
