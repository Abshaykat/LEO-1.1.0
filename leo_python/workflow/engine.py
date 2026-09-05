from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Awaitable, Callable
from .types import Workflow

@dataclass(frozen=True)
class StepResult:
    step_id: str
    success: bool
    output: Any = None
    error: str | None = None

class WorkflowEngine:
    def __init__(self) -> None:
        self._paused: set[str] = set()

    async def run(self, workflow: Workflow, execute: Callable[[str, dict[str, Any]], Awaitable[Any]]) -> list[StepResult]:
        results: list[StepResult] = []
        if workflow.id in self._paused:
            return results
        for step in workflow.steps:
            if workflow.id in self._paused:
                break
            try:
                output = await execute(step.capability, step.parameters)
                results.append(StepResult(step.id, True, output))
            except Exception as exc:
                results.append(StepResult(step.id, False, error=str(exc)))
                break
        return results

    def pause(self, workflow_id: str) -> None:
        self._paused.add(workflow_id)

    def resume(self, workflow_id: str) -> None:
        self._paused.discard(workflow_id)
