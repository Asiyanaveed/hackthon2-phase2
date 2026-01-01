import os
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

# Import models to register them with SQLModel metadata
from src.database.models import User, Task, Conversation, Message

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is required. "
        "Please set DATABASE_URL to your Neon PostgreSQL connection string."
    )

engine = create_engine(DATABASE_URL, echo=False)


def get_session() -> Generator[Session, None, None]:
    """
    Creates and yields a database session.

    Returns:
        A generator that yields a SQLModel Session.
    """
    with Session(engine) as session:
        yield session


def init_db():
    """
    Initializes database by creating all tables.

    This function should be called on application startup.
    """
    SQLModel.metadata.create_all(engine)
