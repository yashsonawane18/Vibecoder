from fastapi import APIRouter
from app.services import storage

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

@router.get("")
def get_leaderboard():
    """
    Feature 6: Kaggle-Style Feedback & Mentor Ratings Leaderboard
    """
    users = storage.get_users()
    return {"users": users}
