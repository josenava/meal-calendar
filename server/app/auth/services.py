from app.users.repositories import UserRepository


class AuthUserService:
    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository

    def authenticate(self, email: str, plain_password: str) -> str:
        return ""

    def unauthenticate(self):
        pass
