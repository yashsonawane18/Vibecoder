import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.config import DATA_DIR
from app.models import Question, Answer, User, TierType

QUESTIONS_FILE = DATA_DIR / "questions.json"
ANSWERS_FILE = DATA_DIR / "answers.json"
USERS_FILE = DATA_DIR / "users.json"

def _read_json(file_path: Path) -> list:
    if not file_path.exists():
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []

def _write_json(file_path: Path, data: list):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")

def calculate_tier(points: int) -> TierType:
    if points < 50:
        return "Novice"
    elif points < 150:
        return "Expert"
    elif points < 300:
        return "Master"
    return "Grandmaster"

# ----------------- QUESTIONS -----------------
def get_questions(subject: Optional[str] = None) -> List[Dict[str, Any]]:
    questions = _read_json(QUESTIONS_FILE)
    if subject and subject != "All":
        questions = [q for q in questions if q.get("subject") == subject]
    # Sort by created_at desc
    return sorted(questions, key=lambda q: q.get("created_at", ""), reverse=True)

def get_question_by_id(question_id: str) -> Optional[Dict[str, Any]]:
    questions = _read_json(QUESTIONS_FILE)
    for q in questions:
        if q.get("id") == question_id:
            return q
    return None

def create_question(data: Dict[str, Any]) -> Dict[str, Any]:
    questions = _read_json(QUESTIONS_FILE)
    new_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    
    question = {
        "id": new_id,
        "title": data["title"],
        "body": data["body"],
        "subject": data["subject"],
        "author_name": data.get("author_name", "Anonymous Student"),
        "author_role": data.get("author_role", "student"),
        "created_at": now_iso,
        "ai_answer": data.get("ai_answer", None),
        "mode": data.get("mode", "mentor"),
        "status": "open"
    }
    questions.append(question)
    _write_json(QUESTIONS_FILE, questions)
    return question

def update_question_ai_answer(question_id: str, ai_answer: str):
    questions = _read_json(QUESTIONS_FILE)
    for q in questions:
        if q.get("id") == question_id:
            q["ai_answer"] = ai_answer
            break
    _write_json(QUESTIONS_FILE, questions)

# ----------------- ANSWERS -----------------
def get_answers_by_question_id(question_id: str) -> List[Dict[str, Any]]:
    answers = _read_json(ANSWERS_FILE)
    q_answers = [a for a in answers if a.get("question_id") == question_id or a.get("questionId") == question_id]
    
    # Normalize keys
    for a in q_answers:
        if "questionId" in a and "question_id" not in a:
            a["question_id"] = a["questionId"]
        if "authorName" in a and "author_name" not in a:
            a["author_name"] = a["authorName"]
        if "authorRole" in a and "author_role" not in a:
            a["author_role"] = a["authorRole"]
        if "isBestFit" in a and "is_best_fit" not in a:
            a["is_best_fit"] = a["isBestFit"]
        if "bestFitReason" in a and "best_fit_reason" not in a:
            a["best_fit_reason"] = a["bestFitReason"]
        if "createdAt" in a and "created_at" not in a:
            a["created_at"] = a["createdAt"]

    # Sort: best-fit first, then by votes desc
    return sorted(q_answers, key=lambda a: (1 if a.get("is_best_fit") else 0, a.get("votes", 0)), reverse=True)

def create_answer(data: Dict[str, Any]) -> Dict[str, Any]:
    answers = _read_json(ANSWERS_FILE)
    new_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    
    answer = {
        "id": new_id,
        "question_id": data["question_id"],
        "body": data["body"],
        "author_name": data.get("author_name", "Anonymous Mentor"),
        "author_role": data.get("author_role", "senior"),
        "votes": 0,
        "is_best_fit": False,
        "best_fit_reason": None,
        "created_at": now_iso
    }
    answers.append(answer)
    _write_json(ANSWERS_FILE, answers)
    
    # Ensure user exists in leaderboard
    get_or_create_user(answer["author_name"], answer["author_role"])
    
    return answer

def vote_answer(answer_id: str, direction: str) -> Optional[Dict[str, Any]]:
    answers = _read_json(ANSWERS_FILE)
    target = None
    for a in answers:
        if a.get("id") == answer_id:
            target = a
            break
            
    if not target:
        return None
        
    delta = 1 if direction == "up" else -1
    target["votes"] = target.get("votes", 0) + delta
    _write_json(ANSWERS_FILE, answers)
    
    # Update author's Kaggle karma (+10 for upvote, -5 for downvote)
    author_name = target.get("author_name") or target.get("authorName")
    author_role = target.get("author_role") or target.get("authorRole") or "senior"
    if author_name:
        points_delta = 10 if direction == "up" else -5
        update_user_points(author_name, points_delta, author_role)
        
    return target

def mark_best_fit(question_id: str, answer_id: str, reason: str) -> Optional[Dict[str, Any]]:
    answers = _read_json(ANSWERS_FILE)
    questions = _read_json(QUESTIONS_FILE)
    
    target_answer = None
    for a in answers:
        q_id = a.get("question_id") or a.get("questionId")
        if q_id == question_id:
            if a.get("id") == answer_id:
                a["is_best_fit"] = True
                a["best_fit_reason"] = reason
                target_answer = a
            else:
                a["is_best_fit"] = False
                a["best_fit_reason"] = None
                
    if target_answer:
        _write_json(ANSWERS_FILE, answers)
        
        # Mark question resolved
        for q in questions:
            if q.get("id") == question_id:
                q["status"] = "resolved"
                break
        _write_json(QUESTIONS_FILE, questions)
        
        # Award author +25 bonus points
        author_name = target_answer.get("author_name") or target_answer.get("authorName")
        author_role = target_answer.get("author_role") or target_answer.get("authorRole") or "senior"
        if author_name:
            update_user_points(author_name, 25, author_role)
            
    return target_answer

# ----------------- USERS & LEADERBOARD -----------------
def get_users() -> List[Dict[str, Any]]:
    users = _read_json(USERS_FILE)
    return sorted(users, key=lambda u: u.get("points", 0), reverse=True)

def get_or_create_user(name: str, role: str = "student") -> Dict[str, Any]:
    users = _read_json(USERS_FILE)
    for u in users:
        if u.get("name") == name:
            return u
            
    new_user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "role": role,
        "points": 0,
        "tier": "Novice"
    }
    users.append(new_user)
    _write_json(USERS_FILE, users)
    return new_user

def update_user_points(name: str, points_delta: int, role: str = "senior") -> Dict[str, Any]:
    users = _read_json(USERS_FILE)
    user = None
    for u in users:
        if u.get("name") == name:
            user = u
            break
            
    if not user:
        user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "role": role,
            "points": 0,
            "tier": "Novice"
        }
        users.append(user)
        
    user["points"] = max(0, user.get("points", 0) + points_delta)
    user["tier"] = calculate_tier(user["points"])
    _write_json(USERS_FILE, users)
    return user
