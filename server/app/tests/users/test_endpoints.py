import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
@pytest.mark.usefixtures("test_db_session")
class TestSignupEndpoint:
    def test_signup_returns_200(self, client: TestClient):
        response = client.post(
            "/users/signup",
            json={
                "email": "foo@bar.com",
                "password": "whatAsecretP1"
            }
        )

        assert response.status_code == 201

    def test_signup_existing_user_returns_422(self, client: TestClient):
        response = client.post(
            "/users/signup",
            json={
                "email": "foo@bar.com",
                "password": "whatAsecretP1"
            }
        )

        assert response.status_code == 201

        response_2 = client.post(
            "/users/signup",
            json={
                "email": "foo@bar.com",
                "password": "whatAsecretP1"
            }
        )

        assert response_2.status_code == 422
