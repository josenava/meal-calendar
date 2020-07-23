from datetime import datetime, timedelta
from typing import Final, Optional
from jose import JWTError, jwt

from app.settings import SECRET_KEY, AUTH_ALGORITHM
from app.users.models import User
from app.users.repositories import UserRepository

from .exceptions import WrongCredentials
from .dtos import AuthToken
from .models import AuthUser


class AuthUserService:
    ACCESS_TOKEN_EXPIRE_MINUTES: Final[int] = 600

    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository

    def create_access_token(self, email: str) -> AuthToken:
        expire = datetime.utcnow() + timedelta(self.ACCESS_TOKEN_EXPIRE_MINUTES)
        data = {"sub": email, "exp": expire.strftime("%Y-%m-%dT%H:%M:%S")}
        encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=AUTH_ALGORITHM)

        return AuthToken(encoded_jwt, expire)

    def get_user_from_token(self, token: str) -> Optional[User]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[AUTH_ALGORITHM])
        except JWTError:
            raise WrongCredentials

        email: Optional[str] = payload.get("sub")
        expires: Optional[str] = payload.get("exp")

        # TODO move this to a class with its own validation
        if email is None:
            raise WrongCredentials
        try:
            expires_at = datetime.strptime(expires, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            raise WrongCredentials
        if expires_at < datetime.utcnow():
            raise WrongCredentials

        return self._user_repository.get_user_by_token(token)

    def authenticate(self, email: str, plain_password: str) -> str:
        user = self._user_repository.get_by_email(email)
        print(user.email)
        if user is None or not user.verify_password(plain_password):
            raise WrongCredentials

        auth_token = self.create_access_token(email)
        if user.auth:
            user.auth.token = auth_token.token
            user.auth.expires_at = auth_token.expires_at
            user.auth.token_hash = user.auth.hash_token(auth_token.token)
        else:
            auth_user = AuthUser.create(auth_token.token, auth_token.expires_at)
            user.auth = auth_user
        self._user_repository.save(user)

        return auth_token.token

    def unauthenticate(self):
        pass
