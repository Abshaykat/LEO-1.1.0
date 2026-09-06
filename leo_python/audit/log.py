from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Mapping

@dataclass(frozen=True)
class AuditEvent:
    timestamp: datetime
    event: str
    capability: str
    details: Mapping[str, Any]

class AuditLog:
    def __init__(self) -> None: self.events: list[AuditEvent] = []
    def record(self, event: str, capability: str, **details: Any) -> AuditEvent:
        entry = AuditEvent(datetime.now(timezone.utc), event, capability, details)
        self.events.append(entry)
        return entry
