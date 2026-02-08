from datetime import date
from typing import Literal

from pydantic import BaseModel, field_validator

MealType = Literal["breakfast", "lunch", "dinner"]

MAX_INGREDIENTS = 10


def clean_ingredients(ingredients: list[str] | None) -> list[str]:
    """Clean and validate ingredients list."""
    if ingredients is None:
        return []
    cleaned = [item.strip() for item in ingredients if item and item.strip()]
    if len(cleaned) > MAX_INGREDIENTS:
        raise ValueError(f'Maximum {MAX_INGREDIENTS} ingredients allowed')
    return cleaned


class MealBase(BaseModel):
    """Base schema for meal data."""
    name: str
    ingredients: list[str] = []
    

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
    
    @field_validator('ingredients')
    @classmethod
    def validate_ingredients(cls, v: list[str] | None) -> list[str]:
        return clean_ingredients(v)


class MealUpdate(BaseModel):
    """Schema for updating an existing meal."""
    date: date
    meal_type: MealType
    name: str
    ingredients: list[str] = []
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @field_validator('ingredients')
    @classmethod
    def validate_ingredients(cls, v: list[str] | None) -> list[str]:
        return clean_ingredients(v)


class MealCopy(BaseModel):
    """Schema for copying a meal to another date/type."""
    target_date: date
    target_meal_type: MealType


class MealSwap(BaseModel):
    """Schema for swapping two meals."""
    meal_id_1: int
    meal_id_2: int


class MealMove(BaseModel):
    """Schema for moving a meal to a different slot."""
    target_date: date
    target_meal_type: MealType


class MealResponse(MealBase):
    """Schema for meal response."""
    id: int
    date: date
    meal_type: MealType
    ingredients: list[str] = []
    
    model_config = {"from_attributes": True}
