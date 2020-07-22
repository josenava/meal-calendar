from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class AuthUser(Base):
    __tablename__ = "auth_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String, nullable=False)
    token_hash = Column(String(32), index=True, nullable=False)
    expires_at = Column(DateTime)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="auth", lazy="joined")
