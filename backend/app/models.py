from sqlalchemy import JSON, Column, Date, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from .database import Base


class Meal(Base):
    """Meal model representing a single meal entry."""
    
    __tablename__ = "meals"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    meal_type = Column(String, nullable=False)  # breakfast, lunch, dinner
    name = Column(String, nullable=False)
    ingredients = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint('date', 'meal_type', name='unique_date_meal_type'),
    )
