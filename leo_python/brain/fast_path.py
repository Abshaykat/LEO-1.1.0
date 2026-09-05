from __future__ import annotations
import re
from dataclasses import dataclass

@dataclass(frozen=True)
class FastPathResult:
    handled: bool
    response: str | None = None

class FastPath:
    def __init__(self, budget=None) -> None:
        self.budget = budget

    def try_handle(self, text: str) -> FastPathResult:
        value = re.sub(r"\s+", " ", text.strip()).casefold()
        responses = {
            "hi": "Hello! How can I help?",
            "hello": "Hello! How can I help?",
            "hey": "Hey! How can I help?",
            "হাই": "হ্যালো! কী করতে পারি?",
            "হ্যালো": "হ্যালো! কী করতে পারি?",
            "thanks": "You're welcome.",
            "thank you": "You're welcome.",
            "ধন্যবাদ": "অবশ্যই।",
        }
        response = responses.get(value)
        return FastPathResult(response is not None, response)
