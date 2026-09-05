from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable

@dataclass(frozen=True)
class ContextItem:
    text: str
    score: float = 0.0

class ContextSelector:
    def __init__(self, max_items: int = 5) -> None:
        self.max_items = max_items

    def select(self, items: Iterable[ContextItem]) -> tuple[ContextItem, ...]:
        return tuple(sorted(items, key=lambda x: x.score, reverse=True)[:self.max_items])
