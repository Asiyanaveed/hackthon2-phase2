"""
Backward compatibility module.
Redirects imports to database.models for SQLModel Task.
"""
from src.database.models import Task

__all__ = ["Task"]
