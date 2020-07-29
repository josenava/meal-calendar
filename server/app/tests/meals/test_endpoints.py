import pytest
from fastapi.testclient import TestClient

from app.auth.models import AuthUser


@pytest.mark.integration
@pytest.mark.usefixtures("test_db_session")
class TestCreateMealEndpoint:
    def test_auth_user_invalid_data_returns_400(self, client: TestClient, auth_user: AuthUser):
        response = client.post(
            "/meals",
            json={"title": "Bacon & Eggs"},
            headers={"Authorization": f'Bearer {auth_user.token}'}
        )

        assert response.status_code == 400
