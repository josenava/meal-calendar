from uuid import uuid4
from datetime import date as datetime_date
from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base
from .enums import MealType


class Meal(Base):
    __tablename__ = "meals"
    __table_args__ = (UniqueConstraint('type', 'date', 'user_id', name='type_date_unique'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4())
    title = Column(String, nullable=False)
    type = Column(Enum(MealType), nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())

    @classmethod
    def create(cls, type: MealType, title: str, date: datetime_date, user_id: int) -> 'Meal':
        return cls(id=uuid4(), title=title, type=type, date=date, user_id=user_id)
