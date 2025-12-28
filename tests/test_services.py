import pytest
from src.models import Task
from src import services

# Fixture to clear tasks before each test
@pytest.fixture(autouse=True)
def clear_tasks():
    """Clears the in-memory task storage before every test."""
    services._tasks.clear()
    services._next_id = 1

def test_create_task():
    """
    Tests creating a new task.
    Ref: T-003, T-008
    """
    task = services.create_task("Test Title", "Test Description")
    assert task.id == 1
    assert task.title == "Test Title"
    assert task.description == "Test Description"
    assert task.completed is False
    assert len(services._tasks) == 1
    assert services._tasks[1] == task

def test_get_task_by_id():
    """
    Tests retrieving a task by its ID.
    Ref: T-009
    """
    task = services.create_task("Test Title", "Test Description")
    retrieved_task = services.get_task_by_id(task.id)
    assert retrieved_task == task

def test_get_task_by_id_not_found():
    """Tests that getting a non-existent task returns None."""
    assert services.get_task_by_id(999) is None

def test_get_all_tasks():
    """
    Tests retrieving all tasks.
    Ref: T-004, T-009
    """
    task1 = services.create_task("Task 1", "Desc 1")
    task2 = services.create_task("Task 2", "Desc 2")
    all_tasks = services.get_all_tasks()
    assert len(all_tasks) == 2
    assert task1 in all_tasks
    assert task2 in all_tasks

def test_update_task():
    """
    Tests updating an existing task.
    Ref: T-005, T-010
    """
    task = services.create_task("Original Title", "Original Desc")
    updated_task = services.update_task(task.id, "New Title", "New Desc")
    assert updated_task.title == "New Title"
    assert updated_task.description == "New Desc"
    assert services.get_task_by_id(task.id).title == "New Title"

def test_update_task_not_found():
    """Tests that updating a non-existent task returns None."""
    assert services.update_task(999, "New Title", "New Desc") is None

def test_delete_task():
    """
    Tests deleting a task.
    Ref: T-006, T-011
    """
    task = services.create_task("Test Title", "Test Description")
    assert len(services.get_all_tasks()) == 1
    result = services.delete_task(task.id)
    assert result is True
    assert len(services.get_all_tasks()) == 0

def test_delete_task_not_found():
    """Tests that deleting a non-existent task returns False."""
    assert services.delete_task(999) is False

def test_toggle_task_completion():
    """
    Tests toggling the completion status of a task.
    Ref: T-007, T-012
    """
    task = services.create_task("Test Title", "Test Description")
    assert task.completed is False
    
    # Toggle to True
    toggled_task = services.toggle_task_completion(task.id)
    assert toggled_task.completed is True
    assert services.get_task_by_id(task.id).completed is True

    # Toggle back to False
    toggled_task_again = services.toggle_task_completion(task.id)
    assert toggled_task_again.completed is False
    assert services.get_task_by_id(task.id).completed is False

def test_toggle_task_not_found():
    """Tests that toggling a non-existent task returns None."""
    assert services.toggle_task_completion(999) is None
