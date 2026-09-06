from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Awaitable, Callable
from .controlled_executor import ExecutionResult
from .capability_runner import CapabilityRunner, CapabilityRunRequest
from ..brain.action import ActionCandidate

@dataclass(frozen=True)
class GovernedAction:
    candidate: ActionCandidate
    approval_id: str | None = None

class ActionExecutor:
    """Bridge from natural-language action candidates into the existing governed runtime."""
    def __init__(self, runner: CapabilityRunner) -> None:
        self.runner = runner

    async def execute(self, action: GovernedAction, *,
                      postcondition: Callable[[Any], bool] | None = None) -> ExecutionResult:
        candidate = action.candidate
        request = CapabilityRunRequest(
            capability=candidate.name,
            parameters=candidate.arguments,
            approval_id=action.approval_id,
            requires_approval=candidate.requires_approval,
            postcondition=postcondition,
        )
        return await self.runner.run(request)
