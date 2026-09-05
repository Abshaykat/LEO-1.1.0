from __future__ import annotations
from dataclasses import dataclass
from ..communication.language import detect_language
from ..memory.retriever import MemoryRetriever
from ..memory.types import MemoryItem

@dataclass(frozen=True)
class ConversationContext:
    language: str
    memories: tuple[MemoryItem, ...]
    action_candidate: bool

class ConversationRouter:
    def __init__(self, retriever: MemoryRetriever | None = None) -> None:
        self.retriever = retriever

    def prepare(self, text: str) -> ConversationContext:
        memories = tuple(self.retriever.search(text)) if self.retriever else ()
        action_candidate = self._looks_like_action(text)
        return ConversationContext(detect_language(text), memories, action_candidate)

    @staticmethod
    def _looks_like_action(text: str) -> bool:
        terms = ("open", "close", "run", "delete", "send", "save", "খুল", "বন্ধ", "চাল", "ডিলিট", "পাঠা")
        value = text.casefold()
        return any(term in value for term in terms)
