from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class LatencyBudget:
    total_ms: int = 3000
    intent_ms: int = 250
    retrieval_ms: int = 250
    planning_ms: int = 500
    model_ms: int = 1700
    response_ms: int = 300

    def validate(self) -> None:
        parts = self.intent_ms + self.retrieval_ms + self.planning_ms + self.model_ms + self.response_ms
        if parts > self.total_ms:
            raise ValueError("Latency budget exceeds total budget.")
