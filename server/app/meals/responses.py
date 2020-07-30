from pydantic import BaseModel


class Meal(BaseModel):
    id: str
    title: str
    type: int
    data: str

    class Config:
        orm_mode = True
