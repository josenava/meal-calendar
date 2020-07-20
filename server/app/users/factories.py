from .repositories import UserRepository
from .services import UserSignupService

from sqlalchemy.orm import Session


def build_user_signup_service(db: Session) -> UserSignupService:
    return UserSignupService(UserRepository(db))
