from __future__ import annotations
import json
from pathlib import Path
from threading import RLock
from .types import MemoryItem

class MemoryStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path
        self._items: dict[str, MemoryItem] = {}
        self._lock = RLock()
        if path and path.exists():
            self._load()

    def save(self, item: MemoryItem) -> None:
        with self._lock:
            self._items[item.id] = item
            self._persist()

    def get(self, item_id: str) -> MemoryItem | None:
        return self._items.get(item_id)

    def list(self, kind: str | None = None) -> list[MemoryItem]:
        values = list(self._items.values())
        return [x for x in values if kind is None or x.kind == kind]

    def _persist(self) -> None:
        if not self.path:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(self.path.suffix + ".tmp")
        tmp.write_text(
            json.dumps([x.__dict__ for x in self._items.values()], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        tmp.replace(self.path)

    def _load(self) -> None:
        raw = json.loads(self.path.read_text(encoding="utf-8"))
        for item in raw:
            self._items[item["id"]] = MemoryItem(**item)
