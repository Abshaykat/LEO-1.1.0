from __future__ import annotations
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class ExecutionResult:
    allowed: bool
    executed: bool
    verified: bool
    reason: str = ""
    value: Any = None
