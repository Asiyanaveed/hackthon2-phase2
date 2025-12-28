from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from src import services
from src.models import Task

app = FastAPI(title="Todo API", version="0.1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskCreate(BaseModel):
    """Model for creating a new task."""
    title: str
    description: str


class TaskUpdate(BaseModel):
    """Model for updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None


@app.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "Todo API is running", "version": "0.1.0"}


@app.get("/tasks", response_model=list[Task])
def get_tasks():
    """
    Retrieve all tasks.

    Returns:
        A list of all tasks.
    """
    return services.get_all_tasks()


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    """
    Retrieve a specific task by ID.

    Args:
        task_id: The ID of the task to retrieve.

    Returns:
        The task with the specified ID.

    Raises:
        HTTPException: If the task is not found.
    """
    task = services.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate):
    """
    Create a new task.

    Args:
        task: The task data to create.

    Returns:
        The newly created task.
    """
    return services.create_task(task.title, task.description)


@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate):
    """
    Update an existing task.

    Args:
        task_id: The ID of the task to update.
        task: The task data to update.

    Returns:
        The updated task.

    Raises:
        HTTPException: If the task is not found.
    """
    existing_task = services.get_task_by_id(task_id)
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")

    title = task.title if task.title else existing_task.title
    description = task.description if task.description else existing_task.description

    updated = services.update_task(task_id, title, description)
    return updated


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    """
    Delete a task.

    Args:
        task_id: The ID of the task to delete.

    Returns:
        A success message.

    Raises:
        HTTPException: If the task is not found.
    """
    if not services.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": f"Task {task_id} deleted successfully"}


@app.patch("/tasks/{task_id}/toggle", response_model=Task)
def toggle_task(task_id: int):
    """
    Toggle the completion status of a task.

    Args:
        task_id: The ID of the task to toggle.

    Returns:
        The updated task.

    Raises:
        HTTPException: If the task is not found.
    """
    task = services.toggle_task_completion(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
