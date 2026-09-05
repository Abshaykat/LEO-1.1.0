from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from ..brain.types import Plan
from ..capabilities import CapabilityRegistry

@dataclass(frozen=True)
class GateResult:
    allowed: bool
    requires_owner_approval: bool
    reason: str

class GovernanceGate:
    """Non-bypassable planning gate. It does not execute capabilities."""

    def __init__(self, registry: CapabilityRegistry) -> None:
        self.registry = registry

    def inspect(self, plan: Plan) -> GateResult:
        if not plan.steps:
            return GateResult(True, False, "No executable steps.")
        for step in plan.steps:
            if self.registry.get(step.capability) is None:
                return GateResult(False, False, f"Capability unavailable: {step.capability}")
        approval = any(s.requires_approval for s in plan.steps) or plan.intent.action
        return GateResult(True, approval, "Plan passed capability gate.")
