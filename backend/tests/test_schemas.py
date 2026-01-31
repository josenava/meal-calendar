"""
Tests for Pydantic schemas validation.
"""
import pytest
from datetime import date
from pydantic import ValidationError

from app.schemas import MealCreate, MealUpdate, MealCopy, MealResponse


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
        for meal_type in ["breakfast", "lunch", "dinner"]:
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
                meal_type="brunch"
            )
        assert "meal_type" in str(exc_info.value).lower()

    def test_meal_create_from_string_date(self):
        """Test creating meal with string date (auto-parsing)."""
        meal = MealCreate(
            name="Test",
            date="2024-01-15",
            meal_type="breakfast"
        )
        assert meal.date == date(2024, 1, 15)


class TestMealUpdate:
    """Tests for MealUpdate schema validation."""

    def test_valid_meal_update(self):
        """Test creating a valid update schema."""
        update = MealUpdate(name="Updated Pancakes")
        assert update.name == "Updated Pancakes"

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
        for meal_type in ["breakfast", "lunch", "dinner"]:
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
                target_meal_type="snack"
            )
        assert "target_meal_type" in str(exc_info.value).lower()

    def test_meal_copy_from_string_date(self):
        """Test creating copy with string date (auto-parsing)."""
        copy = MealCopy(
            target_date="2024-01-20",
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

    def test_meal_response_serialization(self):
        """Test that response serializes correctly."""
        response = MealResponse(
            id=1,
            name="Pancakes",
            date=date(2024, 1, 15),
            meal_type="breakfast"
        )
        data = response.model_dump()
        assert data["id"] == 1
        assert data["name"] == "Pancakes"
        assert data["date"] == date(2024, 1, 15)
        assert data["meal_type"] == "breakfast"
