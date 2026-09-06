from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Callable, Awaitable
from .python_runtime import PythonRuntime, RuntimeDecision, RequestKind
from .capability_runner import CapabilityRunner, CapabilityRunRequest
from ..governance.approval import ApprovalStore
from ..governance.audit import AuditSink
from ..capabilities import CapabilityRegistry

@dataclass(frozen=True)
class RuntimeResult:
    decision: RuntimeDecision
    execution: Any = None

class GovernedPythonRuntime:
    """Pure-Python orchestration: classification/planning then governed execution."""
    def __init__(self, registry: CapabilityRegistry, approvals: ApprovalStore | None = None,
                 audit: AuditSink | None = None) -> None:
        self.registry = registry
        self.approvals = approvals or ApprovalStore()
        self.audit = audit or AuditSink()
        self.router = PythonRuntime()
        self.runner = CapabilityRunner(registry, self.approvals, self.audit)

    async def execute_prepared(self, decision: RuntimeDecision, *,
                               approval_id: str | None = None,
                               postconditions: dict[str, Callable[[Any], bool]] | None = None) -> RuntimeResult:
        if decision.kind is not RequestKind.ACTION or decision.prepared is None:
            return RuntimeResult(decision)
        plan = decision.prepared
        if not getattr(plan, "steps", None):
            return RuntimeResult(decision, None)
        last = None
        for step in plan.steps:
            check = (postconditions or {}).get(step.capability)
            last = await self.runner.run(CapabilityRunRequest(
                capability=step.capability,
                parameters=step.parameters,
                approval_id=approval_id,
                requires_approval=step.requires_approval,
                postcondition=check,
            ))
            if not last.executed or (check is not None and not last.verified):
                break
        return RuntimeResult(decision, last)
