"""Deterministic, side-effect-free natural-language action recognition."""
from __future__ import annotations
from dataclasses import dataclass
from .action import ActionCandidate

@dataclass(frozen=True)
class ActionPlanResult:
    action: ActionCandidate | None
    explanation: str

class ActionPipeline:
    """Classifies supported requests; it never invokes capabilities."""
    _RULES = (
        ("system.open", ("open ", "launch ", "খুলো", "খুলুন", "open koro")),
        ("system.close", ("close ", "quit ", "বন্ধ", "close koro")),
        ("web.search", ("search ", "find ", "খুঁজ", "search koro")),
    )

    def plan(self, text: str) -> ActionPlanResult:
        normalized = " ".join(text.casefold().split())
        if not normalized:
            return ActionPlanResult(None, "Empty request.")
        for name, phrases in self._RULES:
            if any(phrase in normalized for phrase in phrases):
                return ActionPlanResult(
                    ActionCandidate(name, {"raw_text": text}, 0.9, True),
                    f"Prepared {name}; execution still requires governance.",
                )
        return ActionPlanResult(None, "No supported consequential action detected.")
