from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Callable
from ..runtime.controlled_executor import ExecutionResult
from ..runtime.capability_runner import CapabilityRunner, CapabilityRunRequest
from .action import ActionCandidate
@dataclass(frozen=True)
class GovernedAction:
    candidate: ActionCandidate
    approval_id: str | None = None
class ActionExecutor:
    """Bridge from natural-language action candidates into the governed runtime."""
    def __init__(self, runner: CapabilityRunner) -> None: self.runner = runner
    async def execute(self, action: GovernedAction, *, postcondition: Callable[[Any], bool] | None = None) -> ExecutionResult:
        c=action.candidate
        return await self.runner.run(CapabilityRunRequest(c.name,c.arguments,action.approval_id,c.requires_approval,postcondition))
