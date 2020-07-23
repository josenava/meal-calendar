from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .exceptions import WrongCredentials
from .factories import build_auth_user_service

router = APIRouter()


@router.post("/token", status_code=status.HTTP_201_CREATED)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    service = build_auth_user_service(db)
    try:
        token = service.authenticate(form_data.username, form_data.password)
    except WrongCredentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"access_token": token, "token_type": "bearer"}


@router.get("/logout")
def logout():
    return {}
