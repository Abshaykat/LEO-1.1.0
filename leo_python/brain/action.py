"""Action data transferred from planning to governed execution."""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Mapping

@dataclass(frozen=True)
class ActionCandidate:
    name: str
    arguments: Mapping[str, Any] = field(default_factory=dict)
    confidence: float = 0.0
    requires_approval: bool = True

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("Action name is required")
        if not 0 <= self.confidence <= 1:
            raise ValueError("confidence must be between zero and one")
