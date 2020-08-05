from datetime import date
from uuid import UUID

from pydantic import BaseModel

from .enums import MealType


class CreateMealRequest(BaseModel):
    title: str
    type: MealType
    date: date


class UpdateMealRequest(CreateMealRequest):
    id: UUID
