from datetime import date
from pydantic import BaseModel
from .enums import MealType


class CreateMealRequest(BaseModel):
    title: str
    type: MealType
    date: date
