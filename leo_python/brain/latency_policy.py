from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class LatencyDecision:
    timed_out: bool
    fallback: str

def decide(elapsed_ms: int, budget_ms: int = 3000) -> LatencyDecision:
    if elapsed_ms <= budget_ms:
        return LatencyDecision(False, "")
    return LatencyDecision(True, "I’m taking longer than the response budget, so I won’t claim completion without verification.")
