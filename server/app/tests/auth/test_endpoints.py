import pytest
from fastapi.testclient import TestClient

from app.users.models import User


@pytest.mark.integration
class TestAuthEndpoint:
    @pytest.fixture
    def user(self, test_db_session) -> User:
        user = User.create(id=1, email="hey@bar.com", plain_password="test1234")
        test_db_session.add(user)

        return user

    def test_auth_returns_200_and_updates_token(self, client: TestClient, test_db_session, user):
        pass

    def test_auth_with_existing_token_invalidates_previous_one(
            self, client: TestClient, test_db_session
    ):
        pass
