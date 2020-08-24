from typing import TYPE_CHECKING
from datetime import datetime
import hashlib

from app.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from app.users.models import User


class AuthUser(Base):
    __tablename__ = "auth_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String, nullable=False)
    token_hash = Column(String(32), index=True, nullable=False)
    expires_at = Column(DateTime)

    user_id = Column(Integer, ForeignKey("users.id"))

    user: 'User' = relationship("User", back_populates="auth", lazy="joined")

    @classmethod
    def create(cls, token: str, expires_at: datetime) -> 'AuthUser':
        return cls(
            token=token,
            expires_at=expires_at,
            token_hash=cls.hash_token(token),
        )

    @staticmethod
    def hash_token(token: str) -> str:
        return hashlib.md5(token.encode()).hexdigest()
