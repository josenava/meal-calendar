import pytest
from fastapi.testclient import TestClient

from app.users.models import User


@pytest.mark.integration
class TestAuthEndpoint:
    @pytest.fixture
    def user(self, test_db_session) -> User:
        user = User.create(id=1, email="hey@bar.com", plain_password="test1234")
        test_db_session.add(user)
        test_db_session.commit()

        return user

    def test_auth_returns_200_and_updates_token(self, client: TestClient, test_db_session, user):
        response = client.post(
            "/auth/token",
            data={"username": "hey@bar.com", "password": "test1234"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 201
        assert user.auth is not None

    def test_logout_deletes_token(
            self, client: TestClient, test_db_session, user
    ):
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
