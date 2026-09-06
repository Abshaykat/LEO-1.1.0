from __future__ import annotations
from dataclasses import dataclass
from .normalize import normalize, language_hint
from .intent import IntentResult, detect_intent

@dataclass(frozen=True)
class ConversationResult:
    text: str
    language: str
    intent: IntentResult

class ConversationRouter:
    def route(self, text: str) -> ConversationResult:
        clean=normalize(text)
        return ConversationResult(clean, language_hint(clean), detect_intent(clean))
