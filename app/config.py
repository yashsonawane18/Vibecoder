import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env.local first if it exists, else .env
env_local = BASE_DIR / ".env.local"
if env_local.exists():
    load_dotenv(env_local)
else:
    load_dotenv(BASE_DIR / ".env")

PRIMARY_GEMINI_API_KEY = os.getenv("PRIMARY_GEMINI_API_KEY", "").strip()
SECONDARY_GEMINI_API_KEY = os.getenv("SECONDARY_GEMINI_API_KEY", "").strip()

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

SUBJECTS = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Electronics",
    "General"
]
