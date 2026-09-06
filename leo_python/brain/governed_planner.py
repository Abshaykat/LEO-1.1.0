from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .action_pipeline import ActionPipeline, ActionPlanResult

@dataclass(frozen=True)
class PreparedAction:
    plan: ActionPlanResult
    ready: bool
    reason: str = ""

class GovernedActionPlanner:
    """Prepares an action without executing it. Execution remains approval-gated."""
    def __init__(self) -> None:
        self.pipeline = ActionPipeline()

    def prepare(self, text: str) -> PreparedAction:
        plan = self.pipeline.plan(text)
        if plan.action is None:
            return PreparedAction(plan, False, "No actionable capability detected.")
        return PreparedAction(plan, True)
