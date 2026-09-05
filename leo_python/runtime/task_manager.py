from __future__ import annotations
import asyncio
from uuid import uuid4
from .task import TaskRecord, TaskState

class TaskManager:
    def __init__(self) -> None:
        self.tasks: dict[str, TaskRecord] = {}
        self._running: dict[str, asyncio.Task] = {}

    def create(self) -> TaskRecord:
        record = TaskRecord(str(uuid4()))
        self.tasks[record.task_id] = record
        return record

    async def run(self, record: TaskRecord, operation) -> TaskRecord:
        record.state = TaskState.RUNNING
        try:
            record.result = await operation()
            record.state = TaskState.SUCCEEDED
        except asyncio.CancelledError:
            record.state = TaskState.CANCELLED
            raise
        except Exception as exc:
            record.error = str(exc)
            record.state = TaskState.FAILED
        return record

    def cancel(self, task_id: str) -> bool:
        task = self._running.get(task_id)
        if task is None:
            return False
        task.cancel()
        return True
