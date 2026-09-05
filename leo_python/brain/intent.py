from __future__ import annotations
import re
from .types import Intent

_ACTIONS = re.compile(r"\b(open|close|run|send|save|delete|search|start|stop)\b|খুল|বন্ধ|চাল|পাঠা|সেভ|ডিলিট|খুঁজ", re.I)

def infer_intent(text: str) -> Intent:
    value = text.strip()
    action = bool(_ACTIONS.search(value))
    return Intent(goal=value, action=action, confidence=0.65 if action else 0.80)
