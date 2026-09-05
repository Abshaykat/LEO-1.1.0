from __future__ import annotations
from collections import OrderedDict
from dataclasses import dataclass
from time import monotonic

@dataclass(frozen=True)
class CacheEntry:
    value: str
    expires_at: float

class ResponseCache:
    def __init__(self, max_items: int = 256, ttl_seconds: float = 300.0) -> None:
        if max_items <= 0 or ttl_seconds <= 0:
            raise ValueError("cache limits must be positive")
        self.max_items, self.ttl_seconds = max_items, ttl_seconds
        self._items: OrderedDict[str, CacheEntry] = OrderedDict()

    def get(self, key: str) -> str | None:
        item = self._items.get(key)
        if item is None:
            return None
        if item.expires_at <= monotonic():
            self._items.pop(key, None)
            return None
        self._items.move_to_end(key)
        return item.value

    def put(self, key: str, value: str) -> None:
        self._items[key] = CacheEntry(value, monotonic() + self.ttl_seconds)
        self._items.move_to_end(key)
        while len(self._items) > self.max_items:
            self._items.popitem(last=False)
