import json
import re
from typing import List, Dict, Any
from app.services.ai_engine import get_client

def check_semantic_duplicates(title: str, body: str, subject: str, existing_questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Feature 4: Redundancy & Duplicate Question Prevention
    Analyzes semantic similarity against questions in the same subject.
    Returns matched questions so students can see existing answers before posting duplicates.
    """
    if not title or not existing_questions:
        return []

    # Filter to same subject
    subject_questions = [q for q in existing_questions if q.get("subject") == subject]
    if not subject_questions:
        return []

    client = get_client()
    if not client.has_keys():
        # Fallback to token similarity if AI key is unavailable
        return _fallback_keyword_similarity(title, subject_questions)

    questions_summary = "\n".join(
        [f"- ID: {q['id']} | Title: {q['title']}" for q in subject_questions[:15]]
    )

    prompt = f"""You are an academic deduplication engine.
A student is about to ask this new doubt:
Subject: {subject}
Title: {title}
Description: {body}

Here is a list of existing questions in the forum:
{questions_summary}

Determine if any of the existing questions are semantically asking the same academic doubt or core concept.
Respond ONLY with a JSON array of matching question IDs, e.g.:
["id1", "id2"]
If there are no semantic duplicates, respond with an empty JSON array:
[]"""

    try:
        raw_output = client.generate(prompt)
        # Extract JSON array
        cleaned = re.sub(r"```json|```", "", raw_output).strip()
        match = re.search(r"\[.*?\]", cleaned, re.DOTALL)
        if match:
            duplicate_ids = json.loads(match.group(0))
            if isinstance(duplicate_ids, list):
                return [q for q in subject_questions if q.get("id") in duplicate_ids]
    except Exception as e:
        print(f"Semantic deduplication AI call error: {e}")

    # Fallback to local token similarity
    return _fallback_keyword_similarity(title, subject_questions)

def _fallback_keyword_similarity(title: str, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fast lexical similarity fallback."""
    title_words = set(re.findall(r"\w+", title.lower()))
    stopwords = {"what", "is", "the", "how", "to", "in", "and", "or", "for", "of", "a", "an", "can", "someone", "explain"}
    keywords = title_words - stopwords

    if not keywords:
        return []

    matches = []
    for q in questions:
        q_words = set(re.findall(r"\w+", q.get("title", "").lower()))
        overlap = keywords.intersection(q_words)
        # If more than 50% keyword overlap
        if len(overlap) >= max(2, len(keywords) * 0.5):
            matches.append(q)
    return matches[:3]
