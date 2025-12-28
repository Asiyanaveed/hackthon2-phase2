from typing import Dict, List, Optional
from src.models import Task
from src import storage

# Initialize storage on import
_tasks: Dict[int, Task] = storage.load_tasks()
_next_id: int = storage.load_next_id()

def create_task(title: str, description: str) -> Task:
    """
    Creates a new task and saves it to persistent storage.

    Args:
        title: The title of the task.
        description: The description of the task.

    Returns:
        The newly created Task object.
    """
    global _next_id
    task = Task(id=_next_id, title=title, description=description)
    _tasks[task.id] = task
    _next_id += 1
    storage.save_tasks(_tasks, _next_id)
    return task

def get_task_by_id(task_id: int) -> Optional[Task]:
    """
    Retrieves a single task by its ID.

    Args:
        task_id: The ID of the task to retrieve.

    Returns:
        The Task object if found, otherwise None.
    """
    return _tasks.get(task_id)

def get_all_tasks() -> List[Task]:
    """
    Retrieves all tasks.

    Returns:
        A list of all Task objects.
    """
    return list(_tasks.values())

def update_task(task_id: int, title: str, description: str) -> Optional[Task]:
    """
    Updates an existing task's title and description.

    Args:
        task_id: The ID of the task to update.
        title: The new title for the task.
        description: The new description for the task.

    Returns:
        The updated Task object if found, otherwise None.
    """
    task = get_task_by_id(task_id)
    if task:
        task.title = title
        task.description = description
        storage.save_tasks(_tasks, _next_id)
        return task
    return None

def delete_task(task_id: int) -> bool:
    """
    Deletes a task by its ID.

    Args:
        task_id: The ID of the task to delete.

    Returns:
        True if the task was deleted, False otherwise.
    """
    if task_id in _tasks:
        del _tasks[task_id]
        storage.save_tasks(_tasks, _next_id)
        return True
    return False

def toggle_task_completion(task_id: int) -> Optional[Task]:
    """
    Toggles the 'completed' status of a task.

    Args:
        task_id: The ID of the task to toggle.

    Returns:
        The updated Task object if found, otherwise None.
    """
    task = get_task_by_id(task_id)
    if task:
        task.completed = not task.completed
        storage.save_tasks(_tasks, _next_id)
        return task
    return None
