import os
import json
import logging
from typing import List, Optional, Dict, Any
from app.config import PRIMARY_GEMINI_API_KEY, SECONDARY_GEMINI_API_KEY

logger = logging.getLogger("ai_engine")

class GeminiFallbackClient:
    """
    Feature 8: Gemini API Key Fallback Engine
    Multi-key failover manager: switches keys on HTTP 429 / 403 / quota limit
    and tests multiple modern model candidates.
    """
    def __init__(self):
        self.api_keys = [
            k for k in [PRIMARY_GEMINI_API_KEY, SECONDARY_GEMINI_API_KEY]
            if k and k != "your-primary-key-here" and k != "your-secondary-key-here"
        ]
        self.current_key_index = 0
        self.candidate_models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash-exp"]

    def has_keys(self) -> bool:
        return len(self.api_keys) > 0

    def generate(self, prompt: str) -> str:
        if not self.has_keys():
            raise RuntimeError("No valid Gemini API keys configured.")

        # Try google-genai or google.generativeai
        last_error = None
        attempts = 0
        max_attempts = len(self.api_keys) * len(self.candidate_models)

        while attempts < max_attempts:
            key = self.api_keys[self.current_key_index]
            
            for model_name in self.candidate_models:
                attempts += 1
                try:
                    # Method 1: Try google-genai client
                    from google import genai
                    client = genai.Client(api_key=key)
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                    )
                    if response and response.text:
                        return response.text
                except Exception as e1:
                    err_str = str(e1).lower()
                    # If quota/rate limit or forbidden, failover key
                    if "429" in err_str or "quota" in err_str or "resource_exhausted" in err_str or "403" in err_str:
                        logger.warning(f"Key index {self.current_key_index} hit limit ({e1}). Rotating to next key...")
                        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
                        last_error = e1
                        break # Break inner model loop to try next key

                    # If model not found or unavailable, try next candidate model
                    if "404" in err_str or "not found" in err_str or "no longer available" in err_str:
                        logger.warning(f"Model {model_name} unavailable, falling back to next candidate model...")
                        last_error = e1
                        continue

                    # Fallback to legacy google.generativeai
                    try:
                        import google.generativeai as legacy_genai
                        legacy_genai.configure(api_key=key)
                        model = legacy_genai.GenerativeModel(model_name)
                        res = model.generate_content(prompt)
                        if res and res.text:
                            return res.text
                    except Exception as e2:
                        logger.warning(f"Legacy model generation failed with {model_name}: {e2}")
                        last_error = e2
                        continue

        if last_error:
            raise last_error
        raise RuntimeError("All Gemini API keys and model candidates failed.")

_client = None

def get_client() -> GeminiFallbackClient:
    global _client
    if _client is None:
        _client = GeminiFallbackClient()
    return _client

def generate_ai_answer(title: str, body: str, subject: str) -> str:
    """
    Feature 5: Instant AI Academic Tutor Chatbot Explanation
    """
    client = get_client()
    if not client.has_keys():
        return "AI assistance is currently offline. Please provide a valid Gemini API key in your configuration."

    prompt = f"""You are an expert academic tutor in {subject}.
A student has asked the following doubt:
Subject: {subject}
Question: {title}
Details: {body}

Provide a clear, pedagogical, concise, and structured academic explanation.
1. Start with an intuitive, high-level summary.
2. Provide step-by-step mathematical/conceptual breakdown with examples.
3. Highlight key takeaways or real-world intuition.
Format with clean markdown (headings, bold, bullet points)."""

    try:
        return client.generate(prompt)
    except Exception as e:
        logger.error(f"Error generating AI answer: {e}")
        return f"Unable to generate AI answer at this moment: {str(e)}"
