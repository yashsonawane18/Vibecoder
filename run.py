import sys
import uvicorn

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("=" * 60)
    print("Academic Doubt Forum (Python FastAPI Edition)")
    print("Server running at: http://127.0.0.1:3000")
    print("API Documentation: http://127.0.0.1:3000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=3000, reload=True)
