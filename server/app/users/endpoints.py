from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.endpoints import get_current_user
from .exceptions import UserAlreadyExists
from .factories import build_user_signup_service
from .models import User
from .requests import SignupForm

router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def create_user(signup_form: SignupForm, db: Session = Depends(get_db)):
    service = build_user_signup_service(db)
    try:
        service.execute(signup_form)
    except UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="User already exists"
        )
    return {}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {}
