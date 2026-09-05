from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class Progress:
    completed: int
    total: int
    message: str = ""

    @property
    def fraction(self) -> float:
        if self.total <= 0:
            return 0.0
        return min(1.0, max(0.0, self.completed / self.total))
