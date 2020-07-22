import os

SQLALCHEMY_DATABASE_URL = os.getenv("POSTGRES_URL", "")

# auth
SECRET_KEY = os.getenv("SECRET_KEY", "not_super_secret")
AUTH_ALGORITHM = os.getenv("AUTH_ALGORITHM", "HS256")
