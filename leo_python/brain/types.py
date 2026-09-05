from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any

@dataclass(frozen=True)
class Intent:
    goal: str
    action: bool
    confidence: float
    parameters: dict[str, Any] = field(default_factory=dict)

@dataclass(frozen=True)
class PlanStep:
    capability: str
    parameters: dict[str, Any]
    requires_approval: bool = False
    expected_outcome: str = ""

@dataclass(frozen=True)
class Plan:
    intent: Intent
    steps: tuple[PlanStep, ...]
    explanation: str = ""
