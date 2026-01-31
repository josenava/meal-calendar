"""
Test configuration and fixtures for the meal calendar backend.
"""
import os

# Set test database before importing app modules
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import Meal

# Create a test database in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with the test database."""
    # Import app here to avoid early database creation
    from app.main import app
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_meal_data():
    """Sample meal data for testing."""
    return {
        "date": "2024-01-15",
        "meal_type": "breakfast",
        "name": "Pancakes with maple syrup"
    }


@pytest.fixture
def sample_meal(db_session, sample_meal_data):
    """Create a sample meal in the database."""
    meal = Meal(
        date=date.fromisoformat(sample_meal_data["date"]),
        meal_type=sample_meal_data["meal_type"],
        name=sample_meal_data["name"]
    )
    db_session.add(meal)
    db_session.commit()
    db_session.refresh(meal)
    return meal


@pytest.fixture
def sample_meals(db_session):
    """Create multiple sample meals in the database."""
    meals_data = [
        {"date": date(2024, 1, 15), "meal_type": "breakfast", "name": "Pancakes"},
        {"date": date(2024, 1, 15), "meal_type": "lunch", "name": "Chicken Salad"},
        {"date": date(2024, 1, 15), "meal_type": "dinner", "name": "Pasta Carbonara"},
        {"date": date(2024, 1, 16), "meal_type": "breakfast", "name": "Oatmeal"},
        {"date": date(2024, 1, 16), "meal_type": "lunch", "name": "Sandwich"},
        {"date": date(2024, 1, 17), "meal_type": "dinner", "name": "Pizza"},
    ]
    
    meals = []
    for data in meals_data:
        meal = Meal(**data)
        db_session.add(meal)
        meals.append(meal)
    
    db_session.commit()
    for meal in meals:
        db_session.refresh(meal)
    
    return meals
