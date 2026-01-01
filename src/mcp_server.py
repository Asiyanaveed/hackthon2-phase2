"""
MCP (Model Context Protocol) Server for Todo AI Chatbot.

This server provides MCP tools for managing tasks through the AI agent.
All tools are stateless and persist data in the database.
"""

import os
import sys
from typing import Optional
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from sqlmodel import Session, select

from src.database.models import Task, Conversation, Message
from src.db import engine
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

# Initialize MCP server
app = Server("todo-mcp-server")


# MCP Tool Definitions

@app.list_tools()
async def list_tools() -> list[Tool]:
    """List all available MCP tools."""
    return [
        Tool(
            name="add_task",
            description="Add a new task to the user's task list. Use this when the user wants to create a new task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the task (required)",
                        "maxLength": 200,
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional description for the task",
                        "maxLength": 1000,
                    },
                },
                "required": ["title"],
            },
        ),
        Tool(
            name="list_tasks",
            description="List all tasks for the user. Can filter by completion status.",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter tasks by status (default: all)",
                    },
                },
            },
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed. Use when the user wants to mark a task as done.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to complete",
                    },
                },
                "required": ["task_id"],
            },
        ),
        Tool(
            name="delete_task",
            description="Delete a task from the user's task list.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to delete",
                    },
                },
                "required": ["task_id"],
            },
        ),
        Tool(
            name="update_task",
            description="Update a task's title or description.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The ID of the task to update",
                    },
                    "title": {
                        "type": "string",
                        "description": "New title for the task (optional)",
                        "maxLength": 200,
                    },
                    "description": {
                        "type": "string",
                        "description": "New description for the task (optional)",
                        "maxLength": 1000,
                    },
                },
                "required": ["task_id"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """
    Execute MCP tool calls.

    All tools:
    - Are stateless (use session from context)
    - Persist data in database
    - Return structured JSON responses
    """
    user_id = arguments.get("user_id")

    try:
        with Session(engine) as session:
            if name == "add_task":
                title = arguments["title"]
                description = arguments.get("description", "")

                if not title.strip():
                    return [TextContent(type="text", text='{"error": "Task title cannot be empty"}')]

                task = create_task(title, description, user_id, session)
                return [TextContent(
                    type="text",
                    text=f'{{"success": true, "message": "Task created successfully", "task": {{"id": {task.id}, "title": "{task.title}", "description": "{task.description or ""}", "completed": {str(task.completed).lower()}}}}}'}
                )]

            elif name == "list_tasks":
                status = arguments.get("status", "all")
                tasks = get_all_tasks(user_id, session)

                if status == "pending":
                    tasks = [t for t in tasks if not t.completed]
                elif status == "completed":
                    tasks = [t for t in tasks if t.completed]

                task_list = []
                for t in tasks:
                    task_list.append({
                        "id": t.id,
                        "title": t.title,
                        "description": t.description or "",
                        "completed": t.completed,
                        "created_at": t.created_at.isoformat(),
                    })

                return [TextContent(
                    type="text",
                    text=f'{{"success": true, "tasks": {task_list}, "count": {len(task_list)}}}'}
                )]

            elif name == "complete_task":
                task_id = arguments["task_id"]

                task = toggle_task_completion(task_id, user_id, session)
                if not task:
                    return [TextContent(type="text", text=f'{{"error": "Task {task_id} not found"}}')]

                status = "completed" if task.completed else "uncompleted"
                return [TextContent(
                    type="text",
                    text=f'{{"success": true, "message": "Task marked as {status}", "task": {{"id": {task.id}, "title": "{task.title}", "completed": {str(task.completed).lower()}}}}}'}
                )]

            elif name == "delete_task":
                task_id = arguments["task_id"]

                success = delete_task(task_id, user_id, session)
                if not success:
                    return [TextContent(type="text", text=f'{{"error": "Task {task_id} not found"}}')]

                return [TextContent(
                    type="text",
                    text=f'{{"success": true, "message": "Task {task_id} deleted successfully"}}'
                )]

            elif name == "update_task":
                task_id = arguments["task_id"]
                title = arguments.get("title")
                description = arguments.get("description")

                # Get current task to preserve values
                existing = get_task_by_id(task_id, user_id, session)
                if not existing:
                    return [TextContent(type="text", text=f'{{"error": "Task {task_id} not found"}}')]

                new_title = title if title else existing.title
                new_description = description if description is not None else existing.description

                task = update_task(task_id, new_title, new_description, user_id, session)
                return [TextContent(
                    type="text",
                    text=f'{{"success": true, "message": "Task updated successfully", "task": {{"id": {task.id}, "title": "{task.title}", "description": "{task.description or ""}", "completed": {str(task.completed).lower()}}}}}'}
                )]

            else:
                return [TextContent(type="text", text=f'{{"error": "Unknown tool: {name}"}}')]

    except Exception as e:
        return [TextContent(type="text", text=f'{{"error": "{str(e)}"}}')]


async def main():
    """Run the MCP server using stdio transport."""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options(),
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
