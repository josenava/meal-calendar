from uuid import UUID
from datetime import date
from pydantic import BaseModel


class Meal(BaseModel):
    id: UUID
    title: str
    type: int
    date: date

    class Config:
        orm_mode = True
