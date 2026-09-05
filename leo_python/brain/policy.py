from __future__ import annotations
from .types import Plan

def requires_approval(plan: Plan) -> bool:
    return any(step.requires_approval for step in plan.steps) or plan.intent.action
