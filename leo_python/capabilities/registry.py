from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

Executor = Callable[[dict[str, Any]], Awaitable[Any]]

@dataclass(frozen=True)
class Capability:
    name: str
    description: str
    executor: Executor
    enabled: bool = True

class CapabilityRegistry:
    def __init__(self) -> None:
        self._items: dict[str, Capability] = {}

    def register(self, capability: Capability) -> None:
        if capability.name in self._items:
            raise ValueError(f"Capability already registered: {capability.name}")
        self._items[capability.name] = capability

    def get(self, name: str) -> Capability | None:
        item = self._items.get(name)
        return item if item and item.enabled else None

    def discover(self, query: str = "") -> list[Capability]:
        q = query.casefold().strip()
        values = list(self._items.values())
        if not q:
            return values
        return [x for x in values if q in x.name.casefold() or q in x.description.casefold()]
