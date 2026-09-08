# 🎓 Academic Doubt Forum

A centralized, subject-wise Question & Answer web application designed to eliminate duplicate academic doubts and hesitation among students by connecting them with mentors (seniors, peers, faculty) and AI assistance.

## 🚀 Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Centralised Subject-Wise Q&A** | Students post doubts tagged with subjects; mentors submit answers |
| 2 | **AI Best-Fit Solution Analyzer** | AI evaluates multiple answers and highlights the best solution |
| 3 | **PDF Generation** | Export doubts and solutions into printable revision sheets |
| 4 | **Duplicate Question Prevention** | Semantic similarity check prevents redundant posts |
| 5 | **AI vs. Mentor Mode** | Toggle between instant AI answers or community forum posting |
| 6 | **Kaggle-Style Ratings** | Upvoting/downvoting with mentor leaderboard and tier badges |
| 7 | **Voice Assistance** | Speech-to-Text input and Text-to-Speech answer playback |
| + | **Gemini API Fallback** | Multi-key failover for uninterrupted AI service |

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Local JSON file storage (zero-setup)
- **AI**: Google Gemini API with multi-key fallback
- **PDF**: jsPDF (client-side generation)
- **Voice**: Browser Web Speech API

## 📦 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yashsonawane18/Vibecoder.git
cd Vibecoder

# 2. Install dependencies
npm install

# 3. Configure Gemini API keys
# Edit .env.local with your keys:
# PRIMARY_GEMINI_API_KEY=your-key-here
# SECONDARY_GEMINI_API_KEY=your-backup-key-here

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
academic-doubt-forum/
├── data/                          # JSON file storage (seed data included)
│   ├── questions.json
│   ├── answers.json
│   └── users.json
├── src/
│   ├── app/
│   │   ├── api/                   # API routes
│   │   │   ├── questions/         # CRUD + dedup + best-fit
│   │   │   └── leaderboard/       # Mentor rankings
│   │   ├── question/[id]/         # Question detail page
│   │   ├── leaderboard/           # Leaderboard page
│   │   ├── page.jsx               # Home forum feed
│   │   ├── layout.jsx             # Root layout
│   │   └── globals.css            # Tailwind + custom classes
│   ├── components/
│   │   ├── Navbar.jsx             # Navigation
│   │   ├── QuestionCard.jsx       # Doubt card with voice
│   │   ├── AskQuestionModal.jsx   # Doubt input with AI/Mentor toggle
│   │   ├── AnswerSection.jsx      # Answers list + voting
│   │   ├── BestFitAnswerCard.jsx  # AI-selected top answer
│   │   ├── RedundancyAlert.jsx    # Duplicate warning
│   │   ├── PdfExportButton.jsx    # PDF download
│   │   └── VoiceButton.jsx        # STT/TTS controls
│   └── lib/
│       ├── ai.js                  # Gemini API + fallback engine
│       ├── storage.js             # JSON file CRUD
│       ├── voice.js               # Web Speech API wrappers
│       └── pdf.js                 # jsPDF generator
└── package.json
```

## 🏗️ Architecture

The application follows a clean architecture with the Web Interface at the center, connecting all 7 features:

- **Student User** → Types/Speaks doubt → **Web Interface**
- **Web Interface** → Check Redundancy → **Similarity Engine** → Show Existing Answers
- **Web Interface** → AI or Mentors? → **AI Chatbot** / **Subject Forum DB**
- **Mentors** → Answer Doubt → **Forum DB** → **AI Best-Fit Analyzer** → Top Solution
- **Web Interface** → Rate & Vote → **Kaggle-style Ratings**
- **Web Interface** → Export PDF → **PDF Revision Generator**
- **Web Interface** → Voice I/O → **Web Speech API** / **speechSynthesis**

## 👥 Team

Built for hackathon demonstration.
