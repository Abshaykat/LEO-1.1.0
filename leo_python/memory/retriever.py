from __future__ import annotations
import re
from .store import MemoryStore
from .types import MemoryItem

_WORDS = re.compile(r"[\w\u0980-\u09FF]+")

class MemoryRetriever:
    def __init__(self, store: MemoryStore) -> None:
        self.store = store

    def search(self, query: str, limit: int = 5) -> list[MemoryItem]:
        tokens = {x.casefold() for x in _WORDS.findall(query) if len(x) > 1}
        scored: list[tuple[int, MemoryItem]] = []
        for item in self.store.list():
            haystack = f"{item.content} {item.kind}".casefold()
            score = sum(1 for token in tokens if token in haystack)
            if score:
                scored.append((score, item))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scored[:limit]]
