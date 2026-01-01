"""
Database initialization script.

Run this script to create database tables:
    uv run init_db.py
"""
import sys

def main():
    print("Initializing database...")
    try:
        from src.db import init_db, engine
        from sqlmodel import text

        # Test database connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Database connection: OK")

        # Create tables
        init_db()
        print("Database tables created: OK")
        print("Database initialized successfully!")
        return 0
    except Exception as e:
        print(f"Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
