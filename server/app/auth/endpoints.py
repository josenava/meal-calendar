from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.users.models import User
from .exceptions import WrongCredentials
from .factories import build_auth_user_service
from .oauth2 import oauth2_scheme

router = APIRouter()


def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme)
) -> User:
    auth_service = build_auth_user_service(db)
    try:
        user = auth_service.get_user_from_token(token)
        if user is None:
            raise WrongCredentials
    except WrongCredentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


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
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = build_auth_user_service(db)
    service.unauthenticate(current_user)

    return {}
