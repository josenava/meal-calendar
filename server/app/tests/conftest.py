import os
from unittest.mock import Mock

import pytest
from app.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists, drop_database

from app.users.models import User
from app.auth.models import AuthUser
from app.auth.services import AuthUserService


SQLALCHEMY_DATABASE_URL = os.environ.get("POSTGRES_URL_TEST", "")

engine = create_engine(SQLALCHEMY_DATABASE_URL)


def get_test_db():
    SessionLocal = sessionmaker(bind=engine)
    test_db = SessionLocal()

    try:
        yield test_db
    finally:
        test_db.close()


@pytest.fixture(scope="session", autouse=True)
def create_test_database():
    """
    Create a clean database on every test case.
    We use the `sqlalchemy_utils` package here for a few helpers in consistently
    creating and dropping the database.
    """
    if database_exists(SQLALCHEMY_DATABASE_URL):
        drop_database(SQLALCHEMY_DATABASE_URL)
    create_database(SQLALCHEMY_DATABASE_URL)  # Create the test database.
    Base.metadata.create_all(engine)  # Create the tables.
    app.dependency_overrides[get_db] = get_test_db  # Mock the Database Dependency
    yield  # Run the tests.
    drop_database(SQLALCHEMY_DATABASE_URL)  # Drop the test database.


@pytest.fixture
def test_db_session():
    """Returns an sqlalchemy session, and after the test tears down everything properly."""

    SessionLocal = sessionmaker(bind=engine)

    db = SessionLocal()
    yield db
    # Drop all data after each test
    for tbl in reversed(Base.metadata.sorted_tables):
        engine.execute(tbl.delete())
    # put back the connection to the connection pool
    db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def user(test_db_session) -> User:
    user = User.create(id=1, email="hey@bar.com", plain_password="test1234")
    test_db_session.add(user)
    test_db_session.commit()

    return user


@pytest.fixture
def auth_user(test_db_session, user: User) -> AuthUser:
    service = AuthUserService(Mock())
    auth_token = service.create_access_token(user.email)
    auth_user = AuthUser.create(auth_token.token, auth_token.expires_at)
    user.auth = auth_user
    test_db_session.add(user)
    test_db_session.commit()

    return auth_user
