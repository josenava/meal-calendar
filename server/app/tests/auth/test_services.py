import pytest
from unittest.mock import Mock

from app.auth.exceptions import WrongCredentials
from app.auth.services import AuthUserService
from app.users.models import User


@pytest.mark.unit
class TestAuthUserService:
    def setup(self):
        self._user_repository = Mock()

    def test_get_user_from_token_raises_wrong_credentials_when_bad_token(self):
        token = "Madeuptoken"
        service = AuthUserService(self._user_repository)

        with pytest.raises(WrongCredentials):
            service.get_user_from_token(token)

    def test_get_user_from_expired_token_raises_wrong_credentials(self):
        # this token has an expired date
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoZXlAYmFyLmNvbSIsImV4cCI6MTU5NTU2NDcxMX0.vQsF0Edxswm5YVxe0AUDp9hnJPFuXOb1VsZ4_6JqIqI"

        service = AuthUserService(self._user_repository)
        with pytest.raises(WrongCredentials):
            service.get_user_from_token(token)

    def test_authenticate_user_with_bad_password_raises_wrong_credentials(self):
        self._user_repository.get_by_email.return_value = User.create(
            id=1, email="foo@bar", plain_password="not_this_one")

        service = AuthUserService(self._user_repository)
        with pytest.raises(WrongCredentials):
            service.authenticate("foo@bar.com", "whatAPassword")
