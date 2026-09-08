from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime

RoleType = Literal["student", "senior", "faculty", "peer"]
TierType = Literal["Novice", "Expert", "Master", "Grandmaster"]
ModeType = Literal["ai", "mentor"]

class QuestionCreate(BaseModel):
    title: str
    body: str
    subject: str
    author_name: str = "Anonymous Student"
    author_role: RoleType = "student"
    mode: ModeType = "mentor"

class AnswerCreate(BaseModel):
    body: str
    author_name: str = "Anonymous Mentor"
    author_role: RoleType = "senior"

class VoteRequest(BaseModel):
    answer_id: str
    direction: Literal["up", "down"]

class DuplicateCheckRequest(BaseModel):
    title: str
    body: str = ""
    subject: str

class Question(BaseModel):
    id: str
    title: str
    body: str
    subject: str
    author_name: str
    author_role: RoleType
    created_at: str
    ai_answer: Optional[str] = None
    mode: ModeType = "mentor"
    status: Literal["open", "resolved"] = "open"

class Answer(BaseModel):
    id: str
    question_id: str
    body: str
    author_name: str
    author_role: RoleType
    votes: int = 0
    is_best_fit: bool = False
    best_fit_reason: Optional[str] = None
    created_at: str

class User(BaseModel):
    id: str
    name: str
    role: RoleType
    points: int = 0
    tier: TierType = "Novice"
