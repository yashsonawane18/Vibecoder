from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routes import questions, leaderboard, views

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(
    title="Academic Doubt Forum",
    description="Subject-Wise Academic Q&A with AI Assistance & Kaggle-Style Mentor Ratings",
    version="2.0.0"
)

# Static files
static_dir = BASE_DIR / "static"
static_dir.mkdir(exist_ok=True)
(static_dir / "css").mkdir(exist_ok=True)
(static_dir / "js").mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include Routers
app.include_router(views.router)
app.include_router(questions.router)
app.include_router(leaderboard.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=3000, reload=True)
