from typing import List, Optional
from sqlmodel import Session, select
from src.database.models import Task, User, Conversation, Message
from src.db import get_session, engine
from src.auth import hash_password, verify_password
from datetime import datetime


# User Service Functions

def create_user(email: str, password: str, session: Session) -> User:
    """
    Create a new user with email and hashed password.

    Args:
        email: The user's email address.
        password: The user's plain text password.
        session: Database session.

    Returns:
        The newly created User object.
    """
    user = User(email=email, password_hash=hash_password(password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_user_by_email(email: str, session: Session) -> Optional[User]:
    """
    Retrieve a user by their email address.

    Args:
        email: The user's email address.
        session: Database session.

    Returns:
        The User object if found, otherwise None.
    """
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    return user


def get_user_by_id(user_id: int, session: Session) -> Optional[User]:
    """
    Retrieve a user by their ID.

    Args:
        user_id: The user's ID.
        session: Database session.

    Returns:
        The User object if found, otherwise None.
    """
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    return user


def authenticate_user(email: str, password: str, session: Session) -> Optional[User]:
    """
    Authenticate a user with email and password.

    Args:
        email: The user's email address.
        password: The user's plain text password.
        session: Database session.

    Returns:
        The User object if authentication succeeds, otherwise None.
    """
    user = get_user_by_email(email, session)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_task(title: str, description: str, user_id: str, session: Session) -> Task:
    """
    Creates a new task and saves it to the database for a specific user.

    Args:
        title: The title of the task.
        description: The description of the task.
        user_id: The Better Auth user identifier.
        session: Database session.

    Returns:
        The newly created Task object.
    """
    task = Task(title=title, description=description, user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_task_by_id(task_id: int, user_id: str, session: Session) -> Optional[Task]:
    """
    Retrieves a single task by its ID for a specific user.

    Args:
        task_id: The ID of the task to retrieve.
        user_id: The Better Auth user identifier.
        session: Database session.

    Returns:
        The Task object if found, otherwise None.
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    return task


def get_all_tasks(user_id: str, session: Session) -> List[Task]:
    """
    Retrieves all tasks for a specific user.

    Args:
        user_id: The Better Auth user identifier.
        session: Database session.

    Returns:
        A list of all Task objects for the user.
    """
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()
    return list(tasks)


def update_task(task_id: int, title: str, description: str, user_id: str, session: Session) -> Optional[Task]:
    """
    Updates an existing task's title and description for a specific user.

    Args:
        task_id: The ID of the task to update.
        title: The new title for the task.
        description: The new description for the task.
        user_id: The Better Auth user identifier.
        session: Database session.

    Returns:
        The updated Task object if found, otherwise None.
    """
    task = get_task_by_id(task_id, user_id, session)
    if task:
        task.title = title
        task.description = description
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
    return None


def delete_task(task_id: int, user_id: str, session: Session) -> bool:
    """
    Deletes a task by its ID for a specific user.

    Args:
        task_id: The ID of the task to delete.
        user_id: The Better Auth user identifier.
        session: Database session.

    Returns:
        True if the task was deleted, False otherwise.
    """
    task = get_task_by_id(task_id, user_id, session)
    if task:
        session.delete(task)
        session.commit()
        return True
    return False


def toggle_task_completion(task_id: int, user_id: str, session: Session) -> Optional[Task]:
    """
    Toggles the 'completed' status of a task for a specific user.

    Args:
        task_id: The ID of the task to toggle.
        user_id: The Better Auth user identifier.
        session: Database session.

    Returns:
        The updated Task object if found, otherwise None.
    """
    task = get_task_by_id(task_id, user_id, session)
    if task:
        task.completed = not task.completed
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
    return None


# Conversation and Message Service Functions

def create_conversation(user_id: str, title: str = "New Conversation", session: Optional[Session] = None) -> Conversation:
    """
    Create a new conversation for a user.

    Args:
        user_id: The Better Auth user identifier.
        title: Title of the conversation.
        session: Database session (optional, will create one if not provided).

    Returns:
        The newly created Conversation object.
    """
    if session is None:
        with Session(engine) as new_session:
            return create_conversation(user_id, title, new_session)

    conversation = Conversation(user_id=user_id, title=title)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def get_conversation(conversation_id: int, user_id: str, session: Optional[Session] = None) -> Optional[Conversation]:
    """
    Get a conversation by ID for a user.

    Args:
        conversation_id: The conversation ID.
        user_id: The Better Auth user identifier.
        session: Database session (optional).

    Returns:
        The Conversation object if found, otherwise None.
    """
    if session is None:
        with Session(engine) as new_session:
            return get_conversation(conversation_id, user_id, new_session)

    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    )
    conversation = session.exec(statement).first()
    return conversation


def get_user_conversations(user_id: str, session: Optional[Session] = None) -> List[Conversation]:
    """
    Get all conversations for a user.

    Args:
        user_id: The Better Auth user identifier.
        session: Database session (optional).

    Returns:
        A list of Conversation objects.
    """
    if session is None:
        with Session(engine) as new_session:
            return get_user_conversations(user_id, new_session)

    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = session.exec(statement).all()
    return list(conversations)


def add_message(conversation_id: int, role: str, content: str, session: Optional[Session] = None) -> Message:
    """
    Add a message to a conversation.

    Args:
        conversation_id: The conversation ID.
        role: Role of the message sender (user, assistant, system).
        content: Content of the message.
        session: Database session (optional).

    Returns:
        The newly created Message object.
    """
    if session is None:
        with Session(engine) as new_session:
            return add_message(conversation_id, role, content, new_session)

    message = Message(conversation_id=conversation_id, role=role, content=content)
    session.add(message)

    # Update conversation's updated_at timestamp
    conversation = session.get(Conversation, conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)

    session.commit()
    session.refresh(message)
    return message


def get_conversation_messages(conversation_id: int, user_id: str, session: Optional[Session] = None) -> List[Message]:
    """
    Get all messages in a conversation.

    Args:
        conversation_id: The conversation ID.
        user_id: The Better Auth user identifier.
        session: Database session (optional).

    Returns:
        A list of Message objects.
    """
    if session is None:
        with Session(engine) as new_session:
            return get_conversation_messages(conversation_id, user_id, new_session)

    # Verify user owns the conversation
    conversation = get_conversation(conversation_id, user_id, session)
    if not conversation:
        return []

    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = session.exec(statement).all()
    return list(messages)
