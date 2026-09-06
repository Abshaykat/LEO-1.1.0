from __future__ import annotations
from dataclasses import dataclass, field
from time import monotonic
from typing import Any

@dataclass
class MemoryItem:
    key: str
    text: str
    kind: str = "conversation"
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=monotonic)

class LocalMemory:
    """Small dependency-free local memory index; owner-controlled and non-executing."""
    def __init__(self, max_items: int = 5000) -> None:
        self.max_items = max_items
        self._items: list[MemoryItem] = []

    def put(self, item: MemoryItem) -> None:
        self._items = [x for x in self._items if x.key != item.key]
        self._items.append(item)
        if len(self._items) > self.max_items:
            self._items = self._items[-self.max_items:]

    def search(self, query: str, limit: int = 8) -> list[MemoryItem]:
        terms = {t.lower() for t in query.split() if len(t) > 1}
        if not terms:
            return []
        scored = []
        for item in self._items:
            hay = f"{item.text} {item.kind} {' '.join(map(str,item.metadata.values()))}".lower()
            score = sum(t in hay for t in terms)
            if score:
                scored.append((score, item.created_at, item))
        scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
        return [x[2] for x in scored[:limit]]
