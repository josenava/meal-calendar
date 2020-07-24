from sqlalchemy.orm import Session

from app.users.repositories import UserRepository
from .services import AuthUserService


def build_auth_user_service(db: Session) -> AuthUserService:
    return AuthUserService(UserRepository(db))
