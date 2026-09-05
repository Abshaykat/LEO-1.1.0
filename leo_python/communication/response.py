from __future__ import annotations
from .language import preferred_reply_language

MARK_STYLE_RULES = (
    "Act as L.E.O., a capable private personal computer and technology assistant. "
    "Be natural, direct, calm and useful. Understand English, Bangla, Banglish and mixed language. "
    "Reply in the style of the owner's most recent message. Preserve context and references. "
    "Do not claim an action happened unless execution and verification confirm it. "
    "Never bypass permission, owner approval, execution or audit controls."
)

def communication_prompt(user_message: str, context: str = "") -> str:
    language = preferred_reply_language(user_message)
    return f"{MARK_STYLE_RULES}\nPreferred reply language: {language}.\nContext:\n{context}\nUser: {user_message}"

def clean_response(text: str) -> str:
    return "\n".join(line.rstrip() for line in text.strip().splitlines()).strip()
