from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Callable

@dataclass(frozen=True)
class MarkCapabilityAdapter:
    capability: str
    handler: Callable[..., Any]
    enabled: bool = False

    def invoke(self, *args: Any, **kwargs: Any) -> Any:
        if not self.enabled:
            raise PermissionError(f"Mark capability disabled: {self.capability}")
        return self.handler(*args, **kwargs)

class MarkAdapterRegistry:
    def __init__(self) -> None:
        self._adapters: dict[str, MarkCapabilityAdapter] = {}

    def register(self, adapter: MarkCapabilityAdapter) -> None:
        if adapter.capability in self._adapters:
            raise ValueError(f"Duplicate capability: {adapter.capability}")
        self._adapters[adapter.capability] = adapter

    def get(self, capability: str) -> MarkCapabilityAdapter | None:
        return self._adapters.get(capability)

    def names(self) -> tuple[str, ...]:
        return tuple(sorted(self._adapters))
