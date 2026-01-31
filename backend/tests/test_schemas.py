"""
Tests for Pydantic schemas validation.
"""
from datetime import date
from typing import Any, cast

import pytest
from pydantic import ValidationError

from app.schemas import MAX_INGREDIENTS, MealCopy, MealCreate, MealResponse, MealUpdate


class TestMealCreate:
    """Tests for MealCreate schema validation."""

    def test_valid_meal_create(self):
        """Test creating a valid meal schema."""
        meal = MealCreate(
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast"
        )
        assert meal.name == "Pancakes"
        assert meal.date == date(2024, 1, 15)
        assert meal.meal_type == "breakfast"
        assert meal.ingredients == []

    def test_valid_meal_create_with_ingredients(self):
        """Test creating a meal with ingredients."""
        meal = MealCreate(
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast",
            ingredients=["flour", "eggs", "milk"]
        )
        assert meal.name == "Pancakes"
        assert meal.ingredients == ["flour", "eggs", "milk"]

    def test_meal_create_strips_ingredient_whitespace(self):
        """Test that ingredient whitespace is stripped."""
        meal = MealCreate(
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast",
            ingredients=["  flour  ", "eggs", "  milk"]
        )
        assert meal.ingredients == ["flour", "eggs", "milk"]

    def test_meal_create_filters_empty_ingredients(self):
        """Test that empty ingredients are filtered out."""
        meal = MealCreate(
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast",
            ingredients=["flour", "", "  ", "eggs"]
        )
        assert meal.ingredients == ["flour", "eggs"]

    def test_meal_create_max_ingredients_limit(self):
        """Test that exceeding max ingredients raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            MealCreate(
                name="Pancakes",
                date=date(2024, 1, 15),
                meal_type="breakfast",
                ingredients=[f"ingredient{i}" for i in range(MAX_INGREDIENTS + 1)]
            )
        assert f"Maximum {MAX_INGREDIENTS} ingredients allowed" in str(exc_info.value)

    def test_meal_create_strips_whitespace(self):
        """Test that name whitespace is stripped."""
        meal = MealCreate(
            name="  Pancakes  ",
            date=date(2024, 1, 15),
            meal_type="breakfast"
        )
        assert meal.name == "Pancakes"

    def test_meal_create_all_meal_types(self):
        """Test all valid meal types."""
        for meal_type in ("breakfast", "lunch", "dinner"):
            meal = MealCreate(
                name="Test",
                date=date(2024, 1, 15),
                meal_type=meal_type
            )
            assert meal.meal_type == meal_type

    def test_meal_create_empty_name_fails(self):
        """Test that empty name raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            MealCreate(
                name="",
                date=date(2024, 1, 15),
                meal_type="breakfast"
            )
        assert "Name cannot be empty" in str(exc_info.value)

    def test_meal_create_whitespace_name_fails(self):
        """Test that whitespace-only name raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            MealCreate(
                name="   ",
                date=date(2024, 1, 15),
                meal_type="breakfast"
            )
        assert "Name cannot be empty" in str(exc_info.value)

    def test_meal_create_invalid_meal_type_fails(self):
        """Test that invalid meal type raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            MealCreate(
                name="Test",
                date=date(2024, 1, 15),
                meal_type=cast(Any, "brunch")
            )
        assert "meal_type" in str(exc_info.value).lower()

    def test_meal_create_from_string_date(self):
        """Test creating meal with string date (auto-parsing)."""
        meal = MealCreate(
            name="Test",
            date=cast(Any, "2024-01-15"),
            meal_type="breakfast"
        )
        assert meal.date == date(2024, 1, 15)


class TestMealUpdate:
    """Tests for MealUpdate schema validation."""

    def test_valid_meal_update(self):
        """Test creating a valid update schema."""
        update = MealUpdate(name="Updated Pancakes")
        assert update.name == "Updated Pancakes"
        assert update.ingredients == []

    def test_valid_meal_update_with_ingredients(self):
        """Test updating meal with ingredients."""
        update = MealUpdate(name="Pancakes", ingredients=["flour", "eggs"])
        assert update.name == "Pancakes"
        assert update.ingredients == ["flour", "eggs"]

    def test_meal_update_strips_ingredient_whitespace(self):
        """Test that ingredient whitespace is stripped in update."""
        update = MealUpdate(name="Pancakes", ingredients=["  flour  ", "eggs"])
        assert update.ingredients == ["flour", "eggs"]

    def test_meal_update_filters_empty_ingredients(self):
        """Test that empty ingredients are filtered in update."""
        update = MealUpdate(name="Pancakes", ingredients=["flour", "", "eggs"])
        assert update.ingredients == ["flour", "eggs"]

    def test_meal_update_max_ingredients_limit(self):
        """Test that exceeding max ingredients raises validation error in update."""
        with pytest.raises(ValidationError) as exc_info:
            MealUpdate(
                name="Pancakes",
                ingredients=[f"ingredient{i}" for i in range(MAX_INGREDIENTS + 1)]
            )
        assert f"Maximum {MAX_INGREDIENTS} ingredients allowed" in str(exc_info.value)

    def test_meal_update_strips_whitespace(self):
        """Test that name whitespace is stripped."""
        update = MealUpdate(name="  Waffles  ")
        assert update.name == "Waffles"

    def test_meal_update_empty_name_fails(self):
        """Test that empty name raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            MealUpdate(name="")
        assert "Name cannot be empty" in str(exc_info.value)

    def test_meal_update_whitespace_name_fails(self):
        """Test that whitespace-only name raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            MealUpdate(name="   ")
        assert "Name cannot be empty" in str(exc_info.value)


class TestMealCopy:
    """Tests for MealCopy schema validation."""

    def test_valid_meal_copy(self):
        """Test creating a valid copy schema."""
        copy = MealCopy(
            target_date=date(2024, 1, 20),
            target_meal_type="dinner"
        )
        assert copy.target_date == date(2024, 1, 20)
        assert copy.target_meal_type == "dinner"

    def test_meal_copy_all_meal_types(self):
        """Test all valid meal types for copying."""
        for meal_type in ("breakfast", "lunch", "dinner"):
            copy = MealCopy(
                target_date=date(2024, 1, 20),
                target_meal_type=meal_type
            )
            assert copy.target_meal_type == meal_type

    def test_meal_copy_invalid_meal_type_fails(self):
        """Test that invalid meal type raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            MealCopy(
                target_date=date(2024, 1, 20),
                target_meal_type=cast(Any, "snack")
            )
        assert "target_meal_type" in str(exc_info.value).lower()

    def test_meal_copy_from_string_date(self):
        """Test creating copy with string date (auto-parsing)."""
        copy = MealCopy(
            target_date=cast(Any, "2024-01-20"),
            target_meal_type="dinner"
        )
        assert copy.target_date == date(2024, 1, 20)


class TestMealResponse:
    """Tests for MealResponse schema validation."""

    def test_valid_meal_response(self):
        """Test creating a valid response schema."""
        response = MealResponse(
            id=1,
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast"
        )
        assert response.id == 1
        assert response.name == "Pancakes"
        assert response.date == date(2024, 1, 15)
        assert response.meal_type == "breakfast"
        assert response.ingredients == []

    def test_valid_meal_response_with_ingredients(self):
        """Test creating a response schema with ingredients."""
        response = MealResponse(
            id=1,
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast",
            ingredients=["flour", "eggs", "milk"]
        )
        assert response.ingredients == ["flour", "eggs", "milk"]

    def test_meal_response_serialization(self):
        """Test that response serializes correctly."""
        response = MealResponse(
            id=1,
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast",
            ingredients=["flour", "eggs"]
        )
        data = response.model_dump()
        assert data["id"] == 1
        assert data["name"] == "Pancakes"
        assert data["date"] == date(2024, 1, 15)
        assert data["meal_type"] == "breakfast"
        assert data["ingredients"] == ["flour", "eggs"]
