from typing import Any, Dict
import pytest
from fastapi.testclient import TestClient

from app.auth.models import AuthUser
from app.meals.enums import MealType
from app.meals.models import Meal


@pytest.mark.integration
class TestCreateMealEndpoint:
    @pytest.fixture
    def meal_data(self) -> Dict[str, Any]:
        return dict(
            title="Awesome crispy granola",
            type=MealType.BREAKFAST,
            date="2020-07-30"
        )

    def test_auth_user_missing_data_returns_400(self, client: TestClient, auth_user: AuthUser):
        response = client.post(
            "/meals",
            json={"title": "Bacon & Eggs"},
            headers={"Authorization": f'Bearer {auth_user.token}'}
        )

        assert response.status_code == 400

    def test_add_same_meal_type_for_same_day_returns_422(
            self, client: TestClient, auth_user: AuthUser, meal_data: Dict[str, Any]
    ):
        response = client.post(
            "/meals",
            json=meal_data,
            headers={"Authorization": f'Bearer {auth_user.token}'}
        )

        assert response.status_code == 201

        response_2 = client.post(
            "/meals",
            json=meal_data,
            headers={"Authorization": f'Bearer {auth_user.token}'}
        )

        assert response_2.status_code == 422


@pytest.mark.integration
class TestUpdateMealEndpoint:
    def test_meal_gets_properly_updated(self, client: TestClient, auth_user: AuthUser, meal: Meal):
        response = client.put(
            f"/meals/{meal.id}",
            json={},
            headers={"Authorization": f'Bearer {auth_user.token}'}
        )

        assert response.status_code == 200
