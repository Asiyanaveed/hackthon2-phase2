import uvicorn

if __name__ == "__main__":
    """
    Entry point for the FastAPI server.

    Run this script to start the backend API.
    The server will run on http://localhost:8000
    """
    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=True)
