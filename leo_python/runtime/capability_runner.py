from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .controlled_executor import ControlledExecutor, ExecutionResult
from ..capabilities import CapabilityRegistry
from ..governance import AuditSink, ExecutionGuard, ApprovalStore, Verifier

@dataclass(frozen=True)
class CapabilityRunRequest:
    capability: str
    parameters: dict[str, Any]
    approval_id: str | None = None
    requires_approval: bool = False

class CapabilityRunner:
    """Resolves registered capabilities and delegates execution to the guarded runtime."""

    def __init__(self, registry: CapabilityRegistry, approvals: ApprovalStore,
                 audit: AuditSink | None = None) -> None:
        self.registry = registry
        self.approvals = approvals
        self.audit = audit or AuditSink()
        self.executor = ControlledExecutor(
            ExecutionGuard(self.approvals), self.audit, Verifier()
        )

    async def run(self, request: CapabilityRunRequest) -> ExecutionResult:
        capability = self.registry.get(request.capability)
        if capability is None:
            self.audit.record("capability.rejected", capability=request.capability)
            return ExecutionResult(False, False, False, reason="Capability unavailable.")
        action = {
            "capability": request.capability,
            "parameters": request.parameters,
        }
        return await self.executor.run(
            request.approval_id,
            action,
            capability.execute,
            requires_approval=request.requires_approval,
            postcondition=None,
        )
