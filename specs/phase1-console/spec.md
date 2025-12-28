<!-- specs\phase1-console\spec.md -->
# Specification: Todo Console App (Phase I)

## 1. Overview
Build a command-line todo application that stores tasks in memory. This is the foundational Phase I of the project.

## 2. User Stories
* **Add Task:** As a user, I want to create a new task with a title and description.
* **View Tasks:** As a user, I want to see a list of all my tasks with their status.
* **Update Task:** As a user, I want to modify existing task details.
* **Delete Task:** As a user, I want to remove tasks from the list by ID.
* **Mark as Complete:** As a user, I want to toggle task completion status.

## 3. Technical Implementation
* **Storage:** Use a global Python list/dictionary variable to store tasks in memory.
* **Menu:** The app should display a continuous loop menu until the user chooses to exit.
* **IDs:** Tasks should have auto-incrementing unique IDs.