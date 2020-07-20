from sqlalchemy import Boolean, Column, DateTime, Integer, Sequence, String
from sqlalchemy.sql import func
from passlib.context import CryptContext

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id_seq = Sequence('user_id_seq', metadata=Base.metadata)
    id = Column(Integer, user_id_seq, server_default=user_id_seq.next_value(), primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    @staticmethod
    def hash_password(password: str) -> str:
        pwd_context = CryptContext(schemes=["bcrypt"])
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str) -> bool:
        pwd_context = CryptContext(schemes=["bcrypt"])
        return pwd_context.hash(plain_password) == self.password_hash
