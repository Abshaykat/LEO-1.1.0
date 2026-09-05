from __future__ import annotations
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class WorkflowStep:
    id: str
    capability: str
    parameters: dict[str, Any]
    requires_approval: bool = False

@dataclass(frozen=True)
class Workflow:
    id: str
    name: str
    steps: tuple[WorkflowStep, ...]
