from __future__ import annotations
from dataclasses import dataclass, field

@dataclass
class PermissionEngine:
    """Explicit allow-list; no caller can elevate its own authority."""
    allowed: set[str] = field(default_factory=set)
    def allows(self, capability: str) -> bool:
        return capability in self.allowed
