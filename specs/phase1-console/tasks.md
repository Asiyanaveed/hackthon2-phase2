# Tasks: Todo Console App (Phase 1)

**Input**: Implementation Plan from `specs/phase1-console/plan.md`
**Spec**: User Stories from `specs/phase1-console/spec.md`

Tasks are broken down by component as defined in the plan. Each service function and its corresponding test and UI component represents an atomic unit of work that can be tied back to a user story.

---

## Phase 1: Setup & Core Model

**Purpose**: Initialize the project structure and define the core data entity.

- [ ] **T-001** Create the file structure defined in `plan.md`: `src/models.py`, `src/services.py`, `src/cli.py`, and `tests/test_services.py`.
- [ ] **T-002** In `src/models.py`, define the `Task` data structure (e.g., using a class or dataclass) with fields for `id`, `title`, `description`, and `completed`. *(Ref: Plan - Project Structure)*

---

## Phase 2: Business Logic & Testing (Services)

**Purpose**: Implement and validate the core application logic for task management. The tests (T-008 to T-012) should be written first to fail, then the implementation (T-003 to T-007) should make them pass.

### User Story: Add, View, and Manage Tasks

- [ ] **T-003** **[US1: Add Task]** In `src/services.py`, implement the `create_task(title, description)` function. It should handle ID auto-incrementing and add the new task to the in-memory store. *(Ref: Spec - Add Task)*
- [ ] **T-004** **[US2: View Tasks]** In `src/services.py`, implement `get_all_tasks()` to return the list of all tasks. *(Ref: Spec - View Tasks)*
- [ ] **T-005** **[US3: Update Task]** In `src/services.py`, implement `update_task(task_id, title, description)` to modify an existing task. *(Ref: Spec - Update Task)*
- [ ] **T-006** **[US4: Delete Task]** In `src/services.py`, implement `delete_task(task_id)` to remove a task from the store. *(Ref: Spec - Delete Task)*
- [ ] **T-007** **[US5: Mark as Complete]** In `src/services.py`, implement `toggle_task_completion(task_id)` to flip the `completed` status of a task. *(Ref: Spec - Mark as Complete)*

### Tests (To be written before implementation)

- [ ] **T-008** **[Test for T-003]** In `tests/test_services.py`, write a pytest test for `create_task`.
- [ ] **T-009** **[Test for T-004/T-005]** In `tests/test_services.py`, write tests for `get_all_tasks` and `get_task_by_id` (a helper function you'll likely need).
- [ ] **T-010** **[Test for T-006]** In `tests/test_services.py`, write a test for `update_task`.
- [ ] **T-011** **[Test for T-007]** In `tests/test_services.py`, write a test for `delete_task`.
- [ ] **T-012** **[Test for T-008]** In `tests/test_services.py`, write a test for `toggle_task_completion`.

---

## Phase 3: User Interface (CLI)

**Purpose**: Build the user-facing command-line interface that interacts with the `services` module.

- [ ] **T-013** In `src/cli.py`, implement the main menu loop that continuously prompts the user for action (Add, View, Update, etc.) until they choose to exit.
- [ ] **T-014** **[UI for US1]** In `src/cli.py`, implement the UI flow for adding a task, which calls `services.create_task`.
- [ ] **T-015** **[UI for US2]** In `src/cli.py`, implement the UI flow for displaying all tasks, which calls `services.get_all_tasks`.
- [ ] **T-016** **[UI for US3]** In `src/cli.py`, implement the UI flow for updating a task, which calls `services.update_task`.
- [ ] **T-017** **[UI for US4]** In `src/cli.py`, implement the UI flow for deleting a task, which calls `services.delete_task`.
- [ ] **T-018** **[UI for US5]** In `src/cli.py`, implement the UI flow for marking a task as complete, which calls `services.toggle_task_completion`.
- [ ] **T-019** In `src/cli.py`, add user-friendly error handling (e.g., for "task not found"). *(Ref: Plan - Constraints)*

---

## Phase 4: Final Integration

**Purpose**: Connect all the pieces and create the application entry point.

- [ ] **T-020** In `main.py`, write the script entry point (`if __name__ == "__main__":`) that imports from `src.cli` and starts the main application loop.
