from __future__ import annotations
from dataclasses import dataclass
from time import time
from typing import Any

@dataclass(frozen=True)
class TaskEvent:
    task_id: str
    event: str
    timestamp: float
    data: dict[str, Any]

class TaskEventBus:
    def __init__(self) -> None:
        self.events: list[TaskEvent] = []

    def emit(self, task_id: str, event: str, **data: Any) -> TaskEvent:
        item = TaskEvent(task_id, event, time(), data)
        self.events.append(item)
        return item

    def for_task(self, task_id: str) -> list[TaskEvent]:
        return [event for event in self.events if event.task_id == task_id]
