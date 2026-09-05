from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any

@dataclass(frozen=True)
class AgentSpec:
    name: str
    purpose: str
    capabilities: tuple[str, ...] = ()
    memory_scope: str | None = None
    enabled: bool = False
    owner_approved: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)
