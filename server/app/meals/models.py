from uuid import uuid4
from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from .enums import MealType


class Meal(Base):
    __tablename__ = "meals"

    id = Column(UUID, primary_key=True, default=uuid4())
    title = Column(String, nullable=False)
    type = Column(Enum(MealType), nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="meals")
