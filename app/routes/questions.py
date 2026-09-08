from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional, Dict, Any
from app.models import QuestionCreate, AnswerCreate, VoteRequest, DuplicateCheckRequest
from app.services import storage, ai_engine, redundancy_engine, analyzer_engine, pdf_engine

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.get("")
def list_questions(subject: Optional[str] = Query(None)):
    """Feature 1: Subject-Wise Question Retrieval"""
    questions = storage.get_questions(subject)
    return {"questions": questions}

@router.post("")
def create_new_question(payload: QuestionCreate):
    """
    Feature 1 & 5: Ask doubt with AI vs Mentor mode toggle.
    If mode == 'ai', synchronously/instantly generates AI tutor explanation.
    """
    data = payload.dict()
    new_q = storage.create_question(data)

    if payload.mode == "ai":
        ai_resp = ai_engine.generate_ai_answer(payload.title, payload.body, payload.subject)
        storage.update_question_ai_answer(new_q["id"], ai_resp)
        new_q["ai_answer"] = ai_resp

    return {"question": new_q}

@router.get("/{question_id}")
def get_question_detail(question_id: str):
    """Retrieve full doubt thread with answers"""
    q = storage.get_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    answers = storage.get_answers_by_question_id(question_id)
    return {"question": q, "answers": answers}

@router.post("/{question_id}/answers")
def submit_answer(question_id: str, payload: AnswerCreate):
    """
    Feature 1: Submit answer by mentor.
    Feature 2: Auto-triggers AI best-fit solution analyzer when >= 2 answers exist.
    """
    q = storage.get_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    data = payload.dict()
    data["question_id"] = question_id
    new_ans = storage.create_answer(data)

    # Multi-answer best-fit evaluation
    all_answers = storage.get_answers_by_question_id(question_id)
    if len(all_answers) >= 2:
        try:
            result = analyzer_engine.analyze_best_fit_solution(q["title"], q["body"], all_answers)
            if result:
                best_id, reason = result
                storage.mark_best_fit(question_id, best_id, reason)
        except Exception as e:
            print(f"Auto-analyzer error: {e}")

    return {"answer": new_ans}

@router.post("/{question_id}/vote")
def vote_on_answer(question_id: str, payload: VoteRequest):
    """
    Feature 6: Kaggle-style Feedback & Rating system.
    Upvotes increase author rating points; downvotes decrement points.
    """
    updated = storage.vote_answer(payload.answer_id, payload.direction)
    if not updated:
        raise HTTPException(status_code=404, detail="Answer not found")
    return {"answer": updated}

@router.post("/{question_id}/best-fit")
def trigger_ai_best_fit(question_id: str):
    """
    Feature 2: Explicitly trigger AI Best-Fit Solution Analyzer
    """
    q = storage.get_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    answers = storage.get_answers_by_question_id(question_id)
    if not answers:
        raise HTTPException(status_code=400, detail="No answers available to analyze")

    result = analyzer_engine.analyze_best_fit_solution(q["title"], q["body"], answers)
    if not result:
        raise HTTPException(status_code=500, detail="Unable to determine best fit answer")

    best_id, reason = result
    updated = storage.mark_best_fit(question_id, best_id, reason)
    return {"bestFitId": best_id, "reason": reason, "answer": updated}

@router.post("/check-duplicate")
def check_duplicates(payload: DuplicateCheckRequest):
    """
    Feature 4: Redundancy & Duplicate Question Prevention
    """
    all_questions = storage.get_questions()
    duplicates = redundancy_engine.check_semantic_duplicates(
        payload.title, payload.body, payload.subject, all_questions
    )
    return {"duplicates": duplicates}

@router.get("/{question_id}/pdf")
def download_pdf(question_id: str):
    """
    Feature 3: PDF Revision Generator
    Exports current doubt, AI explanation, and solutions into a formatted revision sheet.
    """
    q = storage.get_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    answers = storage.get_answers_by_question_id(question_id)
    best_fit = next((a for a in answers if a.get("is_best_fit")), None)

    pdf_bytes = pdf_engine.generate_revision_pdf(q, answers, best_fit)
    
    filename = f"revision-sheet-{question_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
