"""
Tests for SQLAlchemy models.
"""
import pytest
from datetime import date
from sqlalchemy.exc import IntegrityError

from app.models import Meal


class TestMealModel:
    """Tests for the Meal model."""

    def test_create_meal(self, db_session):
        """Test creating a meal in the database."""
        meal = Meal(
            date=date(2024, 1, 15),
            meal_type="breakfast",
            name="Pancakes"
        )
        db_session.add(meal)
        db_session.commit()
        
        assert meal.id is not None
        assert meal.date == date(2024, 1, 15)
        assert meal.meal_type == "breakfast"
        assert meal.name == "Pancakes"
        assert meal.created_at is not None

    def test_meal_unique_constraint(self, db_session):
        """Test that same date/meal_type combination raises IntegrityError."""
        meal1 = Meal(
            date=date(2024, 1, 15),
            meal_type="breakfast",
            name="Pancakes"
        )
        db_session.add(meal1)
        db_session.commit()
        
        meal2 = Meal(
            date=date(2024, 1, 15),
            meal_type="breakfast",
            name="Waffles"
        )
        db_session.add(meal2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_different_meal_types_same_date(self, db_session):
        """Test that different meal types on same date are allowed."""
        meals = [
            Meal(date=date(2024, 1, 15), meal_type="breakfast", name="Pancakes"),
            Meal(date=date(2024, 1, 15), meal_type="lunch", name="Salad"),
            Meal(date=date(2024, 1, 15), meal_type="dinner", name="Pasta"),
        ]
        for meal in meals:
            db_session.add(meal)
        db_session.commit()
        
        # All should be saved
        saved_meals = db_session.query(Meal).filter(Meal.date == date(2024, 1, 15)).all()
        assert len(saved_meals) == 3

    def test_same_meal_type_different_dates(self, db_session):
        """Test that same meal type on different dates is allowed."""
        meals = [
            Meal(date=date(2024, 1, 15), meal_type="breakfast", name="Pancakes"),
            Meal(date=date(2024, 1, 16), meal_type="breakfast", name="Waffles"),
            Meal(date=date(2024, 1, 17), meal_type="breakfast", name="Eggs"),
        ]
        for meal in meals:
            db_session.add(meal)
        db_session.commit()
        
        # All should be saved
        saved_meals = db_session.query(Meal).filter(Meal.meal_type == "breakfast").all()
        assert len(saved_meals) == 3

    def test_meal_query_by_date_range(self, db_session):
        """Test querying meals by date range."""
        meals = [
            Meal(date=date(2024, 1, 15), meal_type="breakfast", name="Pancakes"),
            Meal(date=date(2024, 1, 16), meal_type="breakfast", name="Waffles"),
            Meal(date=date(2024, 1, 17), meal_type="breakfast", name="Eggs"),
            Meal(date=date(2024, 1, 20), meal_type="breakfast", name="Cereal"),
        ]
        for meal in meals:
            db_session.add(meal)
        db_session.commit()
        
        # Query for range
        results = db_session.query(Meal).filter(
            Meal.date >= date(2024, 1, 15),
            Meal.date <= date(2024, 1, 17)
        ).all()
        
        assert len(results) == 3

    def test_meal_update(self, db_session):
        """Test updating a meal."""
        meal = Meal(
            date=date(2024, 1, 15),
            meal_type="breakfast",
            name="Pancakes"
        )
        db_session.add(meal)
        db_session.commit()
        
        # Update the meal
        meal.name = "Waffles"
        db_session.commit()
        
        # Verify update
        updated = db_session.query(Meal).filter(Meal.id == meal.id).first()
        assert updated.name == "Waffles"

    def test_meal_delete(self, db_session):
        """Test deleting a meal."""
        meal = Meal(
            date=date(2024, 1, 15),
            meal_type="breakfast",
            name="Pancakes"
        )
        db_session.add(meal)
        db_session.commit()
        meal_id = meal.id
        
        # Delete the meal
        db_session.delete(meal)
        db_session.commit()
        
        # Verify deletion
        deleted = db_session.query(Meal).filter(Meal.id == meal_id).first()
        assert deleted is None
