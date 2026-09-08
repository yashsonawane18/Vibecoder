// ==========================================
// Academic Doubt Forum - Client Script
// Voice Assistance (Web Speech API) & UI Helpers
// ==========================================

// Mobile Menu Toggle
const mobileBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// ------------------------------------------
// Feature 7: Voice Output (Text-to-Speech)
// ------------------------------------------
let currentUtterance = null;

function speakText(buttonEl, text) {
  if (!("speechSynthesis" in window)) {
    alert("Speech synthesis is not supported in this browser.");
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (buttonEl) buttonEl.innerHTML = "🔊";
    return;
  }

  const cleanText = text.replace(/[*#_`]/g, "").trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    if (buttonEl) buttonEl.innerHTML = "⏹️ Stop";
  };
  utterance.onend = utterance.onerror = () => {
    if (buttonEl) buttonEl.innerHTML = "🔊";
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// ------------------------------------------
// Feature 7: Voice Input (Speech-to-Text)
// ------------------------------------------
let recognitionInstance = null;
let isRecording = false;

function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported in this browser. Please use Chrome/Edge.");
    return;
  }

  const sttBtn = document.getElementById("voiceSTTBtn");
  const sttIcon = document.getElementById("sttIcon");
  const sttLabel = document.getElementById("sttLabel");
  const bodyInput = document.getElementById("bodyInput");

  if (isRecording && recognitionInstance) {
    recognitionInstance.stop();
    return;
  }

  try {
    recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onstart = () => {
      isRecording = true;
      sttBtn.classList.add("recording-pulse", "bg-red-50", "text-red-600");
      sttIcon.innerText = "🔴";
      sttLabel.innerText = "Listening...";
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (bodyInput) {
        bodyInput.value = bodyInput.value ? `${bodyInput.value} ${transcript}` : transcript;
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionInstance.onend = () => {
      isRecording = false;
      sttBtn.classList.remove("recording-pulse", "bg-red-50", "text-red-600");
      sttIcon.innerText = "🎤";
      sttLabel.innerText = "Voice Input";
    };

    recognitionInstance.start();
  } catch (err) {
    console.error("STT initiation error:", err);
  }
}

// ------------------------------------------
// Feature 5: Modal & Mode Switch
// ------------------------------------------
function openAskModal() {
  const modal = document.getElementById("askModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeAskModal(shouldReload = false) {
  const modal = document.getElementById("askModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (shouldReload) {
    window.location.reload();
  }
}

function setQuestionMode(mode) {
  const hiddenInput = document.getElementById("selectedMode");
  const btnAI = document.getElementById("btnModeAI");
  const btnMentor = document.getElementById("btnModeMentor");
  const submitText = document.getElementById("submitBtnText");

  hiddenInput.value = mode;

  if (mode === "ai") {
    btnAI.className = "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all bg-indigo-600 text-white shadow-sm";
    btnMentor.className = "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all text-gray-600 hover:bg-gray-200";
    if (submitText) submitText.innerText = "🤖 Get Instant AI Answer";
  } else {
    btnMentor.className = "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all bg-indigo-600 text-white shadow-sm";
    btnAI.className = "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all text-gray-600 hover:bg-gray-200";
    if (submitText) submitText.innerText = "👨‍🏫 Post to Mentors Forum";
  }
}

// ------------------------------------------
// Feature 4: Live Redundancy Detection
// ------------------------------------------
let debounceTimer = null;

function handleTitleInput(titleText) {
  clearTimeout(debounceTimer);
  const redundancyAlert = document.getElementById("redundancyAlert");
  const duplicateList = document.getElementById("duplicateList");
  const subject = document.getElementById("subjectInput").value;

  if (!titleText.trim() || titleText.length < 5) {
    redundancyAlert.classList.add("hidden");
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch("/api/questions/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleText, subject: subject }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.duplicates && data.duplicates.length > 0) {
          duplicateList.innerHTML = data.duplicates
            .map(d => `<li><a href="/question/${d.id}" class="hover:text-amber-900 font-semibold" target="_blank">${d.title} →</a></li>`)
            .join("");
          redundancyAlert.classList.remove("hidden");
        } else {
          redundancyAlert.classList.add("hidden");
        }
      }
    } catch (e) {
      console.error("Duplicate check error:", e);
    }
  }, 400);
}

// ------------------------------------------
// Form Submissions
// ------------------------------------------
async function submitQuestionForm(e) {
  e.preventDefault();
  const mode = document.getElementById("selectedMode").value;
  const title = document.getElementById("titleInput").value.trim();
  const body = document.getElementById("bodyInput").value.trim();
  const subject = document.getElementById("subjectInput").value;
  const author_name = document.getElementById("authorInput").value.trim();

  const submitBtn = document.getElementById("submitBtn");
  const spinner = document.getElementById("submitBtnSpinner");
  const submitText = document.getElementById("submitBtnText");

  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  submitText.innerText = mode === "ai" ? "Gemini is thinking..." : "Posting...";

  try {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        subject,
        author_name,
        author_role: "student",
        mode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const q = data.question;

      if (mode === "ai" && q.ai_answer) {
        // Show in-modal instant solution
        document.getElementById("askForm").classList.add("hidden");
        const aiView = document.getElementById("aiResultView");
        aiView.classList.remove("hidden");
        document.getElementById("modalHeader").innerText = "✨ Instant AI Solution";
        document.getElementById("aiResultTitle").innerText = `Question: "${q.title}"`;
        document.getElementById("aiResultText").innerText = q.ai_answer;
        document.getElementById("aiResultThreadLink").href = `/question/${q.id}`;
        document.getElementById("aiResultSpeakBtn").onclick = () => speakText(null, q.ai_answer);
      } else {
        closeAskModal(true);
      }
    } else {
      alert("Failed to post question. Please try again.");
    }
  } catch (err) {
    console.error("Question submission error:", err);
    alert("Connection error. Please try again.");
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add("hidden");
    submitText.innerText = mode === "ai" ? "🤖 Get Instant AI Answer" : "👨‍🏫 Post to Mentors Forum";
  }
}

// Answer submission
async function submitAnswerForm(e, questionId) {
  e.preventDefault();
  const author_name = document.getElementById("ansAuthor").value.trim();
  const author_role = document.getElementById("ansRole").value;
  const body = document.getElementById("ansBody").value.trim();
  const btn = document.getElementById("ansSubmitBtn");

  btn.disabled = true;
  btn.innerText = "Submitting...";

  try {
    const res = await fetch(`/api/questions/${questionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, author_name, author_role }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Error submitting answer.");
    }
  } catch (err) {
    console.error(err);
    alert("Network error.");
  } finally {
    btn.disabled = false;
    btn.innerText = "Submit Answer";
  }
}

// Voting on answers
async function voteAnswer(questionId, answerId, direction) {
  try {
    const res = await fetch(`/api/questions/${questionId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer_id: answerId, direction }),
    });
    if (res.ok) {
      const data = await res.json();
      const voteSpan = document.getElementById(`votes-${answerId}`);
      if (voteSpan) voteSpan.innerText = data.answer.votes;
    }
  } catch (e) {
    console.error("Voting error:", e);
  }
}

// Feature 2: Trigger AI Best-Fit Analyzer
async function triggerBestFitAnalysis(questionId) {
  const btn = document.getElementById("bestFitBtn");
  const spinner = document.getElementById("bestFitSpinner");
  if (btn) btn.disabled = true;
  if (spinner) spinner.classList.remove("hidden");

  try {
    const res = await fetch(`/api/questions/${questionId}/best-fit`, {
      method: "POST",
    });
    if (res.ok) {
      window.location.reload();
    } else {
      alert("AI analysis failed or no answers to analyze.");
    }
  } catch (e) {
    console.error(e);
    alert("Error triggering analysis.");
  } finally {
    if (btn) btn.disabled = false;
    if (spinner) spinner.classList.add("hidden");
  }
}
