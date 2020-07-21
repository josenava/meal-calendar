from unittest.mock import Mock
import pytest

from app.users.exceptions import UserAlreadyExists
from app.users.services import UserSignupService


@pytest.mark.unit
class TestUserSignupService:
    def test_existing_user_raises_user_already_exists(self):
        signup_data = Mock(email="foo@bar.com")
        user_repository = Mock()
        user_repository.get_by_email.return_value = Mock(email="foo@bar.com")

        user_service = UserSignupService(user_repository)

        with pytest.raises(UserAlreadyExists):
            user_service.execute(signup_data)
