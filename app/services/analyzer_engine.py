import json
import re
from typing import List, Dict, Any, Optional, Tuple
from app.services.ai_engine import get_client

def analyze_best_fit_solution(
    question_title: str,
    question_body: str,
    answers: List[Dict[str, Any]]
) -> Optional[Tuple[str, str]]:
    """
    Feature 2: AI Best-Fit Solution Analyzer
    When multiple answers are submitted, AI evaluates them for accuracy, clarity,
    and pedagogical value, selecting the top solution and giving an explanation.
    Returns: (best_fit_answer_id, best_fit_reason) or None
    """
    if not answers or len(answers) == 0:
        return None

    client = get_client()
    if not client.has_keys():
        # Fallback to highest voted answer
        sorted_answers = sorted(answers, key=lambda a: a.get("votes", 0), reverse=True)
        top = sorted_answers[0]
        return top["id"], "Selected based on community consensus and highest upvotes."

    answers_text = ""
    for idx, ans in enumerate(answers, 1):
        answers_text += f"\n--- Answer {idx} (ID: {ans['id']}) by {ans.get('author_name', 'Mentor')} ({ans.get('author_role', 'peer')}) ---\n{ans['body']}\n"

    prompt = f"""You are a master academic evaluator and professor.
A student asked the following question:
Title: {question_title}
Details: {question_body}

Here are the candidate solutions submitted by peers, seniors, and faculty:
{answers_text}

Task:
1. Carefully assess each answer for conceptual correctness, mathematical rigor, clarity, and helpfulness.
2. Select the SINGLE best-fit solution.
3. Formulate a 1-2 sentence rationale explaining why this solution provides the highest educational value.

Respond ONLY with valid JSON in this exact structure:
{{
  "bestFitId": "<answer_id_string>",
  "reason": "<one or two sentence explanation>"
}}"""

    try:
        raw_output = client.generate(prompt)
        cleaned = re.sub(r"```json|```", "", raw_output).strip()
        match = re.search(r"\{.*?\}", cleaned, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
            best_id = data.get("bestFitId")
            reason = data.get("reason", "Identified as the clearest and most conceptually accurate answer.")
            # Verify the ID exists in answers
            if any(a["id"] == best_id for a in answers):
                return best_id, reason
    except Exception as e:
        print(f"Error in analyze_best_fit_solution: {e}")

    # Fallback to highest votes
    sorted_answers = sorted(answers, key=lambda a: a.get("votes", 0), reverse=True)
    top = sorted_answers[0]
    return top["id"], "Selected based on top community upvotes and clarity."
