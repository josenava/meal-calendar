from typing import Optional
from sqlalchemy.orm import Session

from .models import User


class UserRepository:
    def __init__(self, db: Session):
        self._db = db

    def get_next_id(self) -> int:
        return self._db.execute(User.user_id_seq)

    def get_by_email(self, email: str) -> Optional[User]:
        return self._db.query(User).filter(User.email == email).first()

    def save(self, user: User):
        self._db.add(user)
        self._db.commit()
