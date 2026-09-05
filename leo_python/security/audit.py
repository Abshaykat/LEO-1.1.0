from __future__ import annotations
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from threading import RLock
from typing import Any

@dataclass(frozen=True)
class AuditEvent:
    event: str
    actor: str
    tool_name: str | None
    action_hash: str | None
    outcome: str
    details: dict[str, Any]
    timestamp: str

class AuditLog:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path
        self._lock = RLock()

    def record(self, event: str, actor: str, outcome: str, *,
               tool_name: str | None = None, action_hash: str | None = None,
               details: dict[str, Any] | None = None) -> AuditEvent:
        item = AuditEvent(
            event=event, actor=actor, tool_name=tool_name,
            action_hash=action_hash, outcome=outcome,
            details=details or {},
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        if self.path:
            with self._lock:
                self.path.parent.mkdir(parents=True, exist_ok=True)
                with self.path.open("a", encoding="utf-8") as fh:
                    fh.write(json.dumps(asdict(item), ensure_ascii=False, sort_keys=True) + "\n")
        return item
