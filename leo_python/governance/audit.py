from __future__ import annotations
from dataclasses import dataclass
from time import time
from typing import Any

@dataclass(frozen=True)
class AuditEvent:
    event: str
    action_hash: str | None
    timestamp: float
    details: dict[str, Any]

class AuditSink:
    def __init__(self) -> None:
        self.events: list[AuditEvent] = []

    def record(self, event: str, *, action_hash: str | None = None, **details: Any) -> AuditEvent:
        item = AuditEvent(event, action_hash, time(), details)
        self.events.append(item)
        return item
