from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from src.db import get_session, init_db
from src import services
from src.database.models import Task, Conversation, Message
from src.auth import get_current_user, create_jwt_token
from src.agent import TodoAgent

app = FastAPI(title="Todo API", version="0.1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    """
    Initialize database tables on application startup.
    """
    try:
        init_db()
        print("DB initialized")
    except Exception as e:
        print("WARNING: DB init failed:", e)

@app.get("/health")
def health():
    return {"status": "ok"}


# Auth Models
class LoginRequest(BaseModel):
    """Model for login request."""
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Model for signup request."""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Model for auth response."""
    token: str
    user: dict


class TaskCreate(BaseModel):
    """Model for creating a new task."""
    title: str
    description: str


class TaskUpdate(BaseModel):
    """Model for updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None


# Auth Endpoints
@app.post("/auth/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    session=Depends(get_session)
):
    """
    Authenticate a user and return a JWT token.

    Args:
        request: Login credentials (email and password).
        session: Database session.

    Returns:
        JWT token and user info.

    Raises:
        HTTPException: If credentials are invalid.
    """
    user = services.authenticate_user(request.email, request.password, session)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_jwt_token(str(user.id), user.email)
    return {
        "token": token,
        "user": {"id": str(user.id), "email": user.email}
    }


@app.post("/auth/signup", response_model=AuthResponse)
def signup(
    request: SignupRequest,
    session=Depends(get_session)
):
    """
    Create a new user and return a JWT token.

    Args:
        request: Signup data (email and password).
        session: Database session.

    Returns:
        JWT token and user info.

    Raises:
        HTTPException: If email is already registered.
    """
    # Check if user already exists
    existing = services.get_user_by_email(request.email, session)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user
    user = services.create_user(request.email, request.password, session)

    # Generate JWT token
    token = create_jwt_token(str(user.id), user.email)
    return {
        "token": token,
        "user": {"id": str(user.id), "email": user.email}
    }


@app.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "Todo API is running", "version": "0.1.0"}


@app.get("/health")
def health_check():
    """Health check endpoint for debugging."""
    return {"status": "ok", "database": "connected"}


@app.get("/tasks", response_model=List[Task])
def get_tasks(
    user_id: str = Depends(get_current_user),
    session=Depends(get_session)
):
    """
    Retrieve all tasks for the authenticated user.

    Returns:
        A list of all tasks for the user.
    """
    return services.get_all_tasks(user_id, session)


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(
    task_id: int,
    user_id: str = Depends(get_current_user),
    session=Depends(get_session)
):
    """
    Retrieve a specific task by ID for the authenticated user.

    Args:
        task_id: The ID of the task to retrieve.

    Returns:
        The task with the specified ID.

    Raises:
        HTTPException: If the task is not found.
    """
    task = services.get_task_by_id(task_id, user_id, session)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.post("/tasks", response_model=Task)
def create_task(
    task: TaskCreate,
    user_id: str = Depends(get_current_user),
    session=Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    Args:
        task: The task data to create.

    Returns:
        The newly created task.
    """
    return services.create_task(task.title, task.description, user_id, session)


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task: TaskUpdate,
    user_id: str = Depends(get_current_user),
    session=Depends(get_session)
):
    """
    Update an existing task for the authenticated user.

    Args:
        task_id: The ID of the task to update.
        task: The task data to update.

    Returns:
        The updated task.

    Raises:
        HTTPException: If the task is not found.
    """
    existing_task = services.get_task_by_id(task_id, user_id, session)
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")

    title = task.title if task.title else existing_task.title
    description = task.description if task.description else existing_task.description

    updated = services.update_task(task_id, title, description, user_id, session)
    return updated


@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    user_id: str = Depends(get_current_user),
    session=Depends(get_session)
):
    """
    Delete a task for the authenticated user.

    Args:
        task_id: The ID of the task to delete.

    Returns:
        A success message.

    Raises:
        HTTPException: If the task is not found.
    """
    if not services.delete_task(task_id, user_id, session):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": f"Task {task_id} deleted successfully"}


@app.patch("/tasks/{task_id}/toggle", response_model=Task)
def toggle_task(
    task_id: int,
    user_id: str = Depends(get_current_user),
    session=Depends(get_session)
):
    """
    Toggle the completion status of a task for the authenticated user.

    Args:
        task_id: The ID of the task to toggle.

    Returns:
        The updated task.

    Raises:
        HTTPException: If the task is not found.
    """
    task = services.toggle_task_completion(task_id, user_id, session)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# Chat Models

class ChatRequest(BaseModel):
    """Model for chat request."""
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(BaseModel):
    """Model for chat response."""
    response: str
    conversation_id: int
    intent: str
    tool_result: Optional[dict] = None


class ConversationResponse(BaseModel):
    """Model for conversation list item."""
    id: int
    title: str
    updated_at: datetime
    created_at: datetime


class MessageResponse(BaseModel):
    """Model for message item."""
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime


# Chat Endpoints

@app.post("/api/{user_id}/chat", response_model=ChatResponse)
def chat(
    user_id: str,
    request: ChatRequest,
    session=Depends(get_session)
):
    """
    Handle a chat message from the user.

    This endpoint processes natural language messages and manages tasks
    through the AI agent.

    Args:
        user_id: The authenticated user's ID.
        request: Chat request with message and optional conversation_id.
        session: Database session.

    Returns:
        Chat response with AI reply and conversation context.
    """
    try:
        agent = TodoAgent()
        result = agent.chat(
            message=request.message,
            user_id=user_id,
            conversation_id=request.conversation_id,
            session=session,
        )

        return {
            "response": result["response"],
            "conversation_id": result["conversation_id"],
            "intent": result.get("intent", "unknown"),
            "tool_result": result.get("tool_result"),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.get("/api/{user_id}/conversations", response_model=List[ConversationResponse])
def get_conversations(
    user_id: str,
    session=Depends(get_session)
):
    """
    Get all conversations for a user.

    Args:
        user_id: The authenticated user's ID.
        session: Database session.

    Returns:
        List of conversations ordered by most recently updated.
    """
    conversations = services.get_user_conversations(user_id, session)
    return conversations


@app.get("/api/{user_id}/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    user_id: str,
    conversation_id: int,
    session=Depends(get_session)
):
    """
    Get all messages in a conversation.

    Args:
        user_id: The authenticated user's ID.
        conversation_id: The conversation ID.
        session: Database session.

    Returns:
        List of messages in the conversation.
    """
    messages = services.get_conversation_messages(conversation_id, user_id, session)
    return messages
