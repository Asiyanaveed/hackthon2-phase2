"""
Todo AI Agent using OpenAI Agents SDK.

This agent handles conversational task management through natural language.
It integrates with MCP tools for task operations and maintains conversation context.
"""

import os
import json
from typing import Optional
from datetime import datetime

from openai import OpenAI
from sqlmodel import Session

from src.database.models import Task, Conversation, Message
from src.services import (
    create_task,
    get_all_tasks,
    get_task_by_id,
    update_task,
    delete_task,
    toggle_task_completion,
    create_conversation,
    add_message,
    get_conversation_messages,
)


class TodoAgent:
    """
    AI Agent for managing tasks through natural language conversation.

    Uses OpenAI for intent detection and MCP tools for task operations.
    Maintains conversation history for context-aware responses.
    """

    # System prompt for the agent
    SYSTEM_PROMPT = """You are a helpful todo list assistant. Your role is to help users manage their tasks through natural conversation.

Your capabilities:
1. Add new tasks when users describe what they need to do
2. List tasks to show what's on their list
3. Mark tasks as complete when users say they're done
4. Delete tasks when users want to remove them
5. Update tasks when users want to change details

Guidelines:
- Be friendly and conversational
- Confirm actions clearly (e.g., "I've added 'Buy milk' to your task list!")
- If user intent is unclear, ask for clarification
- When listing tasks, organize them clearly
- If a task operation fails, explain why and suggest next steps

You have access to tools for task management. Always use the appropriate tool based on user intent.

Current date/time context: {current_time}
"""

    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize the Todo agent."""
        self.api_key = openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY env variable.")

        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"

    def _get_current_time_context(self) -> str:
        """Get current time for context."""
        now = datetime.utcnow()
        return now.strftime("%Y-%m-%d %H:%M:%S UTC")

    def detect_intent(self, message: str) -> dict:
        """
        Detect user intent from natural language message.

        Returns:
            Dictionary with intent type and extracted entities.
        """
        prompt = f"""Analyze this user message and determine their intent for task management.

Message: "{message}"

Determine the intent and extract relevant entities:
1. If user wants to ADD a task: extract title and optional description
2. If user wants to LIST tasks: determine if they want all, pending, or completed
3. If user wants to COMPLETE a task: extract the task ID or description to identify it
4. If user wants to DELETE a task: extract the task ID or description
5. If user wants to UPDATE a task: extract task ID/description and new title/description
6. If unclear or greeting: indicate clarification needed

Respond with JSON only (no markdown):
{{
    "intent": "add|list|complete|delete|update|clarify|greeting",
    "confidence": 0.0-1.0,
    "entities": {{
        "title": "extracted title or null",
        "description": "extracted description or null",
        "status": "all|pending|completed or null",
        "task_id": "numeric ID if specified or null",
        "task_description": "description to identify task or null"
    }},
    "response": "A brief natural language response if clarification is needed, or null"
}}
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)
        return result

    def execute_tool_call(
        self,
        tool_name: str,
        arguments: dict,
        user_id: str,
        session: Session
    ) -> dict:
        """
        Execute an MCP tool call for task management.

        Args:
            tool_name: Name of the tool to execute
            arguments: Tool arguments
            user_id: User identifier
            session: Database session

        Returns:
            Result dictionary with success status and message
        """
        try:
            if tool_name == "add_task":
                title = arguments.get("title", "")
                description = arguments.get("description", "")

                if not title.strip():
                    return {"success": False, "message": "Task title cannot be empty."}

                task = create_task(title, description, user_id, session)
                return {
                    "success": True,
                    "message": f"I've added '{task.title}' to your task list!",
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "completed": task.completed
                    }
                }

            elif tool_name == "list_tasks":
                status = arguments.get("status", "all")
                tasks = get_all_tasks(user_id, session)

                if status == "pending":
                    tasks = [t for t in tasks if not t.completed]
                elif status == "completed":
                    tasks = [t for t in tasks if t.completed]

                if not tasks:
                    status_text = "pending" if status == "pending" else "completed" if status == "completed" else ""
                    if status_text:
                        return {
                            "success": True,
                            "message": f"You have no {status_text} tasks.",
                            "tasks": []
                        }
                    return {
                        "success": True,
                        "message": "You don't have any tasks yet. Add one to get started!",
                        "tasks": []
                    }

                task_list = []
                for t in tasks:
                    task_list.append({
                        "id": t.id,
                        "title": t.title,
                        "description": t.description or "",
                        "completed": t.completed,
                        "created_at": t.created_at.isoformat()
                    })

                # Build response message
                if status == "pending":
                    msg = f"You have {len(tasks)} pending task(s):"
                elif status == "completed":
                    msg = f"You've completed {len(tasks)} task(s):"
                else:
                    msg = f"You have {len(tasks)} task(s) total:"

                return {
                    "success": True,
                    "message": msg,
                    "tasks": task_list
                }

            elif tool_name == "complete_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return {"success": False, "message": "Please specify which task to complete."}

                task = toggle_task_completion(task_id, user_id, session)
                if not task:
                    return {"success": False, "message": f"Task {task_id} not found."}

                return {
                    "success": True,
                    "message": f"Great job! '{task.title}' is marked as complete.",
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "completed": True
                    }
                }

            elif tool_name == "delete_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return {"success": False, "message": "Please specify which task to delete."}

                success = delete_task(task_id, user_id, session)
                if not success:
                    return {"success": False, "message": f"Task {task_id} not found."}

                return {
                    "success": True,
                    "message": f"Task {task_id} has been deleted."
                }

            elif tool_name == "update_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return {"success": False, "message": "Please specify which task to update."}

                # Get current task to preserve values
                existing = get_task_by_id(task_id, user_id, session)
                if not existing:
                    return {"success": False, "message": f"Task {task_id} not found."}

                title = arguments.get("title") or existing.title
                description = arguments.get("description") if arguments.get("description") is not None else existing.description

                task = update_task(task_id, title, description, user_id, session)
                return {
                    "success": True,
                    "message": f"Task updated! '{task.title}' is ready.",
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description or "",
                        "completed": task.completed
                    }
                }

            else:
                return {"success": False, "message": f"Unknown tool: {tool_name}"}

        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)}"}

    def generate_response(
        self,
        user_message: str,
        tool_result: dict,
        conversation_history: list = None
    ) -> str:
        """
        Generate a natural language response based on tool result.

        Args:
            user_message: Original user message
            tool_result: Result from tool execution
            conversation_history: Previous messages in conversation

        Returns:
            Natural language response string
        """
        history_text = ""
        if conversation_history:
            history_text = "\nRecent conversation:\n"
            for msg in conversation_history[-5:]:  # Last 5 messages
                role = msg.get("role", "user")
                content = msg.get("content", "")[:100]
                history_text += f"- {role}: {content}\n"

        prompt = f"""The user said: "{user_message}"

Tool result: {json.dumps(tool_result, indent=2)}

{history_text}

Generate a friendly, concise response to the user. Confirm what was done clearly.
If there's an error, explain it helpfully and suggest next steps.

Response:"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )

        return response.choices[0].message.content.strip()

    def _find_task_by_description(
        self,
        task_description: str,
        user_id: str,
        session: Session
    ) -> tuple[Optional[Task], list[Task]]:
        """
        Find a task by matching the description against task titles.

        Args:
            task_description: Description or keywords to match
            user_id: User identifier
            session: Database session

        Returns:
            Tuple of (matching_task, all_tasks_with_scores)
        """
        all_tasks = get_all_tasks(user_id, session)

        if not all_tasks:
            return None, []

        # Score tasks by how well they match the description
        scored_tasks = []
        desc_lower = task_description.lower().strip()

        for task in all_tasks:
            title_lower = task.title.lower().strip()

            # Exact match
            if desc_lower == title_lower:
                scored_tasks.append((task, 100))
            # Description contains task title
            elif desc_lower in title_lower:
                scored_tasks.append((task, 80))
            # Task title contains description
            elif title_lower in desc_lower:
                scored_tasks.append((task, 70))
            # Partial word match
            else:
                desc_words = set(desc_lower.split())
                title_words = set(title_lower.split())
                common = desc_words & title_words
                if common:
                    score = len(common) * 20
                    scored_tasks.append((task, score))

        # Sort by score descending
        scored_tasks.sort(key=lambda x: x[1], reverse=True)

        if scored_tasks:
            return scored_tasks[0][0], [t[0] for t in scored_tasks]

        return None, []

    def _resolve_task_id(
        self,
        intent: dict,
        user_id: str,
        session: Session
    ) -> tuple[Optional[int], Optional[str]]:
        """
        Resolve task_id from intent entities.

        For UPDATE/DELETE intents:
        - If task_id is specified, use it
        - Otherwise, list all tasks and match by description
        - If multiple matches, return list for clarification
        - If no match, return None

        Returns:
            Tuple of (resolved_task_id, clarification_message)
        """
        entities = intent.get("entities", {})
        task_id = entities.get("task_id")
        task_description = entities.get("task_description")

        # If task_id is explicitly provided, use it
        if task_id:
            # Verify the task exists
            task = get_task_by_id(int(task_id), user_id, session)
            if task:
                return int(task_id), None
            else:
                return None, f"Task #{task_id} not found."

        # If no task_id, try to find by description
        if task_description:
            matching_task, all_matches = self._find_task_by_description(
                task_description, user_id, session
            )

            if matching_task:
                if len(all_matches) == 1:
                    return matching_task.id, None
                else:
                    # Multiple matches - ask for clarification
                    task_list = "\n".join([
                        f"- #{t.id}: {t.title}" for t in all_matches[:5]
                    ])
                    return None, f"I found multiple tasks matching '{task_description}'. Which one?\n{task_list}"

            return None, f"I couldn't find a task matching '{task_description}'."

        # No task_id and no description
        return None, "Please specify which task you want to update or delete."

    def chat(
        self,
        message: str,
        user_id: str,
        conversation_id: Optional[int] = None,
        session: Optional[Session] = None
    ) -> dict:
        """
        Handle a chat message and return a response.

        Args:
            message: User's message
            user_id: User identifier
            conversation_id: Optional conversation ID for context
            session: Database session

        Returns:
            Dictionary with response, conversation_id, and any tool results
        """
        # Create session if not provided
        close_session = False
        if session is None:
            session = Session(engine)
            close_session = True

        try:
            # Get or create conversation
            if conversation_id:
                conversation = get_conversation_messages(conversation_id, user_id, session)
                if not conversation:
                    conversation = create_conversation(user_id, session=session)
                    conversation_id = conversation.id
                else:
                    # Get actual conversation object
                    from sqlmodel import select
                    stmt = select(Conversation).where(Conversation.id == conversation_id)
                    conv_obj = session.exec(stmt).first()
                    if conv_obj:
                        conversation_id = conv_obj.id
            else:
                conversation = create_conversation(user_id, session=session)
                conversation_id = conversation.id

            # Get conversation history for context
            messages = get_conversation_messages(conversation_id, user_id, session)
            history = [{"role": m.role, "content": m.content} for m in messages]

            # Add user message to history for context
            add_message(conversation_id, "user", message, session)

            # Detect intent
            intent = self.detect_intent(message)

            # Handle greeting/clarification
            if intent.get("intent") in ["greeting", "clarify"]:
                response_text = intent.get("response") or "Hi! I'm your todo assistant. I can help you add, list, complete, delete, or update tasks. What would you like to do?"

                # Add assistant message to history
                add_message(conversation_id, "assistant", response_text, session)

                return {
                    "response": response_text,
                    "conversation_id": conversation_id,
                    "intent": intent.get("intent"),
                    "tool_calls": [],
                }

            # Execute tool if intent is actionable
            tool_result = None
            tool_name = None

            if intent.get("intent") == "add":
                tool_name = "add_task"
                arguments = {
                    "title": intent["entities"]["title"],
                    "description": intent["entities"].get("description", ""),
                }
            elif intent.get("intent") == "list":
                tool_name = "list_tasks"
                arguments = {
                    "status": intent["entities"].get("status", "all"),
                }
            elif intent.get("intent") in ["complete", "delete", "update"]:
                # For complete/delete/update, first resolve task_id
                resolved_id, clarification = self._resolve_task_id(
                    intent, user_id, session
                )

                if not resolved_id:
                    # Could not resolve task - return clarification or error
                    tool_result = {
                        "success": False,
                        "message": clarification or "Please specify which task you want to modify."
                    }
                else:
                    # Task resolved - proceed with the operation
                    if intent.get("intent") == "complete":
                        tool_name = "complete_task"
                        arguments = {"task_id": resolved_id}
                    elif intent.get("intent") == "delete":
                        tool_name = "delete_task"
                        arguments = {"task_id": resolved_id}
                    else:  # update
                        tool_name = "update_task"
                        arguments = {
                            "task_id": resolved_id,
                            "title": intent["entities"].get("title"),
                            "description": intent["entities"].get("description"),
                        }
            else:
                tool_result = {"success": False, "message": "I'm not sure what you want to do. Try asking to add, list, complete, delete, or update a task."}

            # Execute tool if needed
            if tool_name and arguments:
                arguments["user_id"] = user_id
                tool_result = self.execute_tool_call(tool_name, arguments, user_id, session)

            # Generate natural language response
            response_text = self.generate_response(
                message,
                tool_result or {"success": False, "message": "Unknown error"},
                history
            )

            # Add assistant message to history
            add_message(conversation_id, "assistant", response_text, session)

            return {
                "response": response_text,
                "conversation_id": conversation_id,
                "intent": intent.get("intent"),
                "tool_result": tool_result,
            }

        finally:
            if close_session:
                session.close()


def create_agent() -> TodoAgent:
    """Create and return a new TodoAgent instance."""
    return TodoAgent()
