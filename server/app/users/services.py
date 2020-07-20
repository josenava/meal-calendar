from .exceptions import UserAlreadyExists
from .models import User
from .requests import SignupForm
from .repositories import UserRepository


class UserSignupService:
    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository

    def execute(self, signup_data: SignupForm):
        existing_user = self._user_repository.get_by_email(signup_data.email)

        if existing_user:
            raise UserAlreadyExists

        hashed_password = User.hash_password(signup_data.password)
        user = User(
            id=self._user_repository.get_next_id(),
            email=signup_data.email,
            hashed_password=hashed_password,
            is_active=False
        )
        self._user_repository.save(user)
