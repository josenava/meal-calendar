from pydantic import BaseModel, field_validator
from datetime import date
from typing import Literal


MealType = Literal["breakfast", "lunch", "dinner"]


class MealBase(BaseModel):
    """Base schema for meal data."""
    name: str
    

class MealCreate(MealBase):
    """Schema for creating a new meal."""
    date: date
    meal_type: MealType
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class MealUpdate(BaseModel):
    """Schema for updating an existing meal."""
    name: str
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class MealCopy(BaseModel):
    """Schema for copying a meal to another date/type."""
    target_date: date
    target_meal_type: MealType


class MealResponse(MealBase):
    """Schema for meal response."""
    id: int
    date: date
    meal_type: MealType
    
    model_config = {"from_attributes": True}
