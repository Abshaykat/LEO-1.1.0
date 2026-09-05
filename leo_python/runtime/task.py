from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from typing import Any

class TaskState(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class TaskRecord:
    task_id: str
    state: TaskState = TaskState.QUEUED
    result: Any = None
    error: str | None = None
