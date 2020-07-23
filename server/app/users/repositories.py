from typing import Optional
from sqlalchemy.orm import Session

from app.auth.models import AuthUser
from .models import User


class UserRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_next_id(self) -> int:
        return self._db.execute(User.user_id_seq)

    def get_by_email(self, email: str) -> Optional[User]:
        return self._db.query(User).filter(User.email == email).first()

    def get_user_by_token(self, token: str) -> Optional[User]:
        auth_user = self._db.query(AuthUser).filter(AuthUser.token_hash == hash(token)).first()
        if not auth_user:
            return None
        return auth_user.user

    def save(self, user: User, is_update: bool = False):
        if not is_update:
            self._db.add(user)
        self._db.commit()
