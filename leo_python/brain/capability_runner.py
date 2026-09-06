from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Mapping
from .controlled_executor import ExecutionResult
from ..approvals.store import ApprovalStore
from ..audit.log import AuditLog
from ..capabilities.catalog import CapabilityCatalog
from ..permissions.engine import PermissionEngine

Handler = Callable[[Mapping[str, Any]], Awaitable[Any]]

@dataclass(frozen=True)
class CapabilityRunRequest:
    capability: str
    parameters: Mapping[str, Any]
    approval_id: str | None = None
    requires_approval: bool = True
    postcondition: Callable[[Any], bool] | None = None

class CapabilityRunner:
    """The sole execution boundary: catalog, permission, approval, handler, verification, audit."""
    def __init__(self, catalog: CapabilityCatalog, permissions: PermissionEngine, approvals: ApprovalStore, audit: AuditLog, handlers: Mapping[str, Handler]) -> None:
        self.catalog, self.permissions, self.approvals, self.audit = catalog, permissions, approvals, audit
        self.handlers = dict(handlers)

    async def run(self, request: CapabilityRunRequest) -> ExecutionResult:
        descriptor = self.catalog.discover(request.capability)
        if not descriptor or request.capability not in self.handlers:
            return self._deny(request, "Capability is not available.")
        if not self.permissions.allows(request.capability):
            return self._deny(request, "Permission denied.")
        approval_required = request.requires_approval or descriptor.requires_owner_approval
        if approval_required and not self.approvals.valid_for(request.approval_id, request.capability, request.parameters):
            return self._deny(request, "Owner approval is required.")
        try:
            value = await self.handlers[request.capability](request.parameters)
            verified = request.postcondition(value) if request.postcondition else True
        except Exception as error:
            self.audit.record("execution_failed", request.capability, reason=str(error))
            return ExecutionResult(True, False, False, "Capability failed.")
        self.audit.record("executed" if verified else "verification_failed", request.capability)
        return ExecutionResult(True, True, verified, "" if verified else "Post-condition failed.", value)

    def _deny(self, request: CapabilityRunRequest, reason: str) -> ExecutionResult:
        self.audit.record("denied", request.capability, reason=reason)
        return ExecutionResult(False, False, False, reason)
