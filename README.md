# 🎓 Academic Doubt Forum (Python Edition)

A centralized, subject-wise Question & Answer web application designed to eliminate duplicate academic doubts and hesitation among students by connecting them with mentors (seniors, peers, faculty) and AI assistance.

Built with **Python (FastAPI)** backend and Jinja2 templates for **98%+ Python** codebase purity.

---

## 🚀 The 7 Core Features

| # | Feature | Implementation in Python |
|---|---|---|
| **1** | **Centralised Subject-Wise Q&A** | Tagged with academic subjects (*CS, Math, Physics, Electronics, General*). Seniors, peers, and faculty submit answers. |
| **2** | **AI Best-Fit Solution Analyzer** | Multi-answer evaluator in `app/services/analyzer_engine.py` selects the top solution, tags it with an emerald badge, and provides pedagogical reasoning. |
| **3** | **PDF Revision Generator** | Native Python PDF generator in `app/services/pdf_engine.py` using **ReportLab** producing downloadable revision sheets. |
| **4** | **Redundancy & Duplicate Prevention** | Semantic similarity check in `app/services/redundancy_engine.py` suggests answered questions live as students type. |
| **5** | **AI vs. Mentor Mode Selection** | Instant AI tutor explanation using Gemini (`app/services/ai_engine.py`) or posting to the community mentor forum. |
| **6** | **Kaggle-Style Feedback & Ratings** | Community upvotes/downvotes (+10 upvote, -5 downvote, +25 best-fit) with ranked leaderboard and tier badges (*Novice, Expert, Master, Grandmaster*). |
| **7** | **Voice Assistance** | Web Speech API Speech-to-Text (STT) voice input for doubts, and Text-to-Speech (TTS) answer audio playback. |
| **+** | **Gemini API Key Fallback Engine** | Multi-key failover manager in `app/services/ai_engine.py`: automatically rotates keys on HTTP 429/403 rate limits without breaking student workflow. |

---

## 🛠️ Tech Stack

- **Backend & Core Logic (98% Python)**:
  - **FastAPI**: Modern, high-performance web framework
  - **Pydantic**: Data validation and strict typing
  - **ReportLab**: Pure Python PDF revision sheet generator
  - **Google GenAI / Generative AI**: Gemini API with multi-key fallback
  - **Uvicorn**: Lightning-fast ASGI web server
- **Frontend & Templates**:
  - **Jinja2**: Server-side template rendering
  - **Tailwind CSS**: Utility-first styling via CDN
  - **Web Speech API**: Browser-native SpeechRecognition & SpeechSynthesis

---

## 📁 Project Structure

```text
academic-doubt-forum/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point & router registration
│   ├── config.py                # Environment configuration & Gemini API keys
│   ├── models.py                # Pydantic schemas (Questions, Answers, Karma, Tiers)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── questions.py         # Q&A CRUD, Vote, Best-Fit, Deduplication, PDF endpoints
│   │   ├── leaderboard.py       # Kaggle ratings and ranking endpoint
│   │   └── views.py             # HTML page views (Feed, Detail, Leaderboard)
│   └── services/
│       ├── __init__.py
│       ├── storage.py           # Thread-safe JSON persistence & Kaggle karma engine
│       ├── ai_engine.py         # Multi-key Gemini API Fallback Engine
│       ├── redundancy_engine.py # Semantic Deduplication & similarity analyzer
│       ├── analyzer_engine.py   # AI Best-Fit solution evaluator
│       └── pdf_engine.py        # ReportLab PDF Revision Sheet generator
├── templates/
│   ├── base.html                # Shared layout with responsive navigation & Tailwind
│   ├── index.html               # Main forum feed, subject filter pills, Ask Doubt modal
│   ├── question_detail.html     # Question view, AI answer, answers list, voting & PDF
│   └── leaderboard.html         # Kaggle-style rankings with medals and contributor tiers
├── static/
│   ├── css/
│   │   └── style.css            # Custom badge & recording pulse animation styling
│   └── js/
│       └── app.js               # Client-side audio Web Speech API & modal controls
├── data/
│   ├── questions.json           # Seeded questions data
│   ├── answers.json             # Seeded answers data
│   └── users.json               # Seeded mentor profiles & karma points
├── run.py                       # Python runner script
├── requirements.txt             # Python dependencies
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yashsonawane18/Vibecoder.git
cd Vibecoder
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Gemini API Key
Create or edit `.env.local` or `.env`:
```env
PRIMARY_GEMINI_API_KEY=your_actual_gemini_api_key_here
SECONDARY_GEMINI_API_KEY=your_fallback_gemini_key_here
```

### 4. Run the Server
```bash
python run.py
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!
Interactive API docs available at **[http://localhost:3000/docs](http://localhost:3000/docs)**.
