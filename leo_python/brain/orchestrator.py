from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .pipeline import BrainPipeline, BrainResult
from .planner import StructuredPlanner, Plan
from .router import BrainRouter
from ..conversation import ConversationRouter
from ..capabilities import CapabilityRegistry

@dataclass(frozen=True)
class BrainDecision:
    input: str
    prepared: BrainResult
    plan: Plan | None
    needs_approval: bool

class BrainOrchestrator:
    """Coordinates understanding and planning only; it never executes tools."""

    def __init__(self, registry: CapabilityRegistry, model_router: BrainRouter) -> None:
        self.registry = registry
        self.model_router = model_router
        self.pipeline = BrainPipeline(model_router, ConversationRouter())
        self.planner = StructuredPlanner(registry)

    def prepare(self, text: str) -> BrainDecision:
        prepared = self.pipeline.prepare(text)
        return BrainDecision(text, prepared, None, prepared.action_candidate)

    def accept_plan(self, text: str, planner_output: str) -> BrainDecision:
        prepared = self.pipeline.prepare(text)
        plan = self.planner.parse(planner_output)
        return BrainDecision(text, prepared, plan, any(s.requires_approval for s in plan.steps))
