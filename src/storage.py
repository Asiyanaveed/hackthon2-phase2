import json
import os
from typing import Dict, List, Any
from src.models import Task

DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "tasks.json")


def _ensure_data_dir():
    """Ensures the data directory exists."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)


def _load_data() -> Dict[str, Any]:
    """
    Loads tasks from the JSON file.

    Returns:
        A dictionary containing 'tasks' and 'next_id' keys.
    """
    if not os.path.exists(DATA_FILE):
        return {"tasks": {}, "next_id": 1}

    with open(DATA_FILE, "r") as f:
        return json.load(f)


def _save_data(data: Dict[str, Any]):
    """
    Saves tasks to the JSON file.

    Args:
        data: Dictionary containing 'tasks' and 'next_id' keys.
    """
    _ensure_data_dir()
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


def load_tasks() -> Dict[int, Task]:
    """
    Loads all tasks from storage.

    Returns:
        A dictionary of task IDs to Task objects.
    """
    data = _load_data()
    tasks = {}
    for task_id, task_data in data["tasks"].items():
        tasks[int(task_id)] = Task(
            id=task_data["id"],
            title=task_data["title"],
            description=task_data["description"],
            completed=task_data["completed"]
        )
    return tasks


def load_next_id() -> int:
    """
    Loads the next ID to use for new tasks.

    Returns:
        The next available ID.
    """
    data = _load_data()
    return data["next_id"]


def save_tasks(tasks: Dict[int, Task], next_id: int):
    """
    Saves tasks and the next ID to storage.

    Args:
        tasks: Dictionary of task IDs to Task objects.
        next_id: The next available ID.
    """
    tasks_dict = {}
    for task_id, task in tasks.items():
        tasks_dict[str(task_id)] = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed
        }

    data = {
        "tasks": tasks_dict,
        "next_id": next_id
    }
    _save_data(data)
