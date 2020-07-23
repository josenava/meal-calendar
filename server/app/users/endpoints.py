from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .exceptions import UserAlreadyExists
from .factories import build_user_signup_service
from .requests import SignupForm

router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def create_user(signup_form: SignupForm, response: Response, db: Session = Depends(get_db)):
    service = build_user_signup_service(db)
    try:
        service.execute(signup_form)
    except UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="User alredy exists"
        )
    return {}
