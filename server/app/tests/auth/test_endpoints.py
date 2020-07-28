import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
@pytest.mark.usefixtures("test_db_session")
class TestAuthEndpoint:
    def test_auth_returns_200_and_updates_token(self, client: TestClient, user):
        response = client.post(
            "/auth/token",
            data={"username": "hey@bar.com", "password": "test1234"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 201
        assert user.auth is not None

    def test_logout_deletes_token(self, client: TestClient, user):
        response = client.post(
            "/auth/token",
            data={"username": "hey@bar.com", "password": "test1234"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 201

        logout_response = client.get(
            "/auth/logout",
            headers={"Authorization": f'Bearer {response.json()["access_token"]}'}
        )
        assert logout_response.status_code == 200
