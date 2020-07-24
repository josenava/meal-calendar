from fastapi import FastAPI

from .users.endpoints import router as users_router
from .auth.endpoints import router as auth_router


app = FastAPI()
app.include_router(users_router, tags=["users"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
