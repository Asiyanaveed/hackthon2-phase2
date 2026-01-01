from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional
from datetime import datetime
from enum import Enum


class User(SQLModel, table=True):
    """
    SQLModel for User table.

    Attributes:
        id: Primary key, auto-incremented.
        email: User's email address (unique).
        password_hash: Hashed password.
        created_at: Timestamp when user was created.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Task(SQLModel, table=True):
    """
    SQLModel for Task table.

    Attributes:
        id: Primary key, auto-incremented.
        user_id: Foreign key to user (string identifier).
        title: Title of task.
        description: Description of task.
        completed: Task completion status.
        created_at: Timestamp when task was created.
        updated_at: Timestamp when task was last updated.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(index=True, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MessageRole(str, Enum):
    """Enum for message roles in conversation."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Conversation(SQLModel, table=True):
    """
    SQLModel for Conversation table.

    Attributes:
        id: Primary key, auto-incremented.
        user_id: Foreign key to user (string identifier).
        title: Title of conversation.
        created_at: Timestamp when conversation was created.
        updated_at: Timestamp when conversation was last updated.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(default="New Conversation", max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    """
    SQLModel for Message table.

    Attributes:
        id: Primary key, auto-incremented.
        conversation_id: Foreign key to conversation.
        role: Role of message sender (user, assistant, system).
        content: Content of the message.
        created_at: Timestamp when message was created.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    role: str = Field(default="user")
    content: str = Field(max_length=10000)
    created_at: datetime = Field(default_factory=datetime.utcnow)
