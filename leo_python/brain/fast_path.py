from __future__ import annotations
import re
from dataclasses import dataclass
from .latency import LatencyBudget

@dataclass(frozen=True)
class FastPathResult:
    handled: bool
    response: str | None = None

class FastPath:
    """Deterministic, local fast path for common conversational requests."""

    def __init__(self, budget: LatencyBudget | None = None) -> None:
        self.budget = budget or LatencyBudget()
        self.budget.validate()

    def try_handle(self, text: str) -> FastPathResult:
        value = re.sub(r"\s+", " ", text.strip()).casefold()
        if value in {"hi", "hello", "hey", "হাই", "হ্যালো"}:
            return FastPathResult(True, "হ্যালো! কী করতে পারি?")
        if value in {"thanks", "thank you", "ধন্যবাদ"}:
            return FastPathResult(True, "অবশ্যই।")
        return FastPathResult(False)
