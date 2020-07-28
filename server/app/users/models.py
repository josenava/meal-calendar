from sqlalchemy import Boolean, Column, DateTime, Integer, Sequence, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id_seq = Sequence('user_id_seq', metadata=Base.metadata)
    id = Column(Integer, user_id_seq, server_default=user_id_seq.next_value(), primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    auth = relationship("AuthUser", uselist=False, back_populates="user")
    # meals = relationship("Meal", back_populates="user", cascade="all, delete")

    @classmethod
    def create(cls, id: int, email: str, plain_password: str) -> "User":
        hashed_password = cls.hash_password(plain_password)
        return cls(id=id, email=email, hashed_password=hashed_password, is_active=True)

    @staticmethod
    def hash_password(password: str) -> str:
        pwd_context = CryptContext(schemes=["bcrypt"])
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str) -> bool:
        pwd_context = CryptContext(schemes=["bcrypt"])
        return pwd_context.verify(plain_password, self.hashed_password)
