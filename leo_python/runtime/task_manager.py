from __future__ import annotations
import asyncio
from uuid import uuid4
from .task import TaskRecord, TaskState

class TaskManager:
    def __init__(self) -> None:
        self.tasks: dict[str, TaskRecord] = {}
        self._running: dict[str, asyncio.Task] = {}
        self._lock = asyncio.Lock()

    def create(self) -> TaskRecord:
        record = TaskRecord(str(uuid4()))
        self.tasks[record.task_id] = record
        return record

    async def run(self, record: TaskRecord, operation) -> TaskRecord:
        async with self._lock:
            if record.state is not TaskState.QUEUED:
                return record
            record.state = TaskState.RUNNING
            task = asyncio.create_task(operation())
            self._running[record.task_id] = task
        try:
            record.result = await task
            record.state = TaskState.SUCCEEDED
        except asyncio.CancelledError:
            record.state = TaskState.CANCELLED
            raise
        except Exception as exc:
            record.error = str(exc)
            record.state = TaskState.FAILED
        finally:
            self._running.pop(record.task_id, None)
        return record

    def cancel(self, task_id: str) -> bool:
        task = self._running.get(task_id)
        if task is None or task.done():
            return False
        task.cancel()
        return True

    def status(self, task_id: str) -> TaskRecord | None:
        return self.tasks.get(task_id)
