from __future__ import annotations
import json
from typing import Any
from .types import Intent, Plan, PlanStep
from ..capabilities.registry import CapabilityRegistry

class StructuredPlanner:
    """Turns model-proposed JSON into a plan, never grants authority."""

    def __init__(self, registry: CapabilityRegistry) -> None:
        self.registry = registry

    def parse(self, raw: str) -> Plan:
        try:
            data: dict[str, Any] = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("Planner output is not valid JSON.") from exc
        intent_data = data.get("intent")
        if not isinstance(intent_data, dict):
            raise ValueError("Missing structured intent.")
        confidence = float(intent_data.get("confidence", 0))
        if not 0 <= confidence <= 1:
            raise ValueError("Confidence must be between 0 and 1.")
        intent = Intent(
            goal=str(intent_data.get("goal", "")),
            action=bool(intent_data.get("action", False)),
            confidence=confidence,
            parameters=dict(intent_data.get("parameters") or {}),
        )
        steps_data = data.get("steps") or []
        if not isinstance(steps_data, list):
            raise ValueError("steps must be a list.")
        steps: list[PlanStep] = []
        for item in steps_data:
            if not isinstance(item, dict):
                raise ValueError("Invalid plan step.")
            capability = str(item.get("capability", ""))
            if self.registry.get(capability) is None:
                raise ValueError(f"Unknown or disabled capability: {capability}")
            steps.append(PlanStep(
                capability=capability,
                parameters=dict(item.get("parameters") or {}),
                requires_approval=bool(item.get("requires_approval", False)),
                expected_outcome=str(item.get("expected_outcome", "")),
            ))
        return Plan(intent=intent, steps=tuple(steps), explanation=str(data.get("explanation", "")))
