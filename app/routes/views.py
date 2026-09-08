from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
from typing import Optional
from app.services import storage
from app.config import SUBJECTS

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

router = APIRouter(include_in_schema=False)

@router.get("/", response_class=HTMLResponse)
def index_view(request: Request, subject: Optional[str] = Query(None)):
    selected_subject = subject or "All"
    questions = storage.get_questions(None if selected_subject == "All" else selected_subject)
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "questions": questions,
            "subjects": SUBJECTS,
            "selected_subject": selected_subject
        }
    )

@router.get("/question/{question_id}", response_class=HTMLResponse)
def question_detail_view(request: Request, question_id: str):
    q = storage.get_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    answers = storage.get_answers_by_question_id(question_id)
    best_fit = next((a for a in answers if a.get("is_best_fit")), None)
    
    return templates.TemplateResponse(
        request=request,
        name="question_detail.html",
        context={
            "question": q,
            "answers": answers,
            "best_fit": best_fit
        }
    )

@router.get("/leaderboard", response_class=HTMLResponse)
def leaderboard_view(request: Request):
    users = storage.get_users()
    return templates.TemplateResponse(
        request=request,
        name="leaderboard.html",
        context={
            "users": users
        }
    )
