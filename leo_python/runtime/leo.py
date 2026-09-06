"""Composition root for the dependency-free L.E.O. Python runtime."""
from __future__ import annotations
from typing import Any, Awaitable, Callable, Mapping
from ..approvals.store import ApprovalStore
from ..audit.log import AuditLog
from ..brain.action_executor import ActionExecutor, GovernedAction
from ..brain.capability_runner import CapabilityRunner
from ..brain.controlled_executor import ExecutionResult
from ..brain.governed_planner import GovernedActionPlanner, PreparedAction
from ..capabilities.catalog import CapabilityCatalog, CapabilityDescriptor
from ..permissions.engine import PermissionEngine

Handler = Callable[[Mapping[str, Any]], Awaitable[Any]]

class LeoRuntime:
    """Plans requests separately from an owner-approved, auditable execution path."""
    def __init__(self, handlers: Mapping[str, Handler], allowed_capabilities: set[str] | None = None) -> None:
        self.catalog = CapabilityCatalog()
        for name in handlers:
            self.catalog.register(CapabilityDescriptor(name))
        self.permissions = PermissionEngine(set(allowed_capabilities or handlers.keys()))
        self.approvals = ApprovalStore()
        self.audit = AuditLog()
        self.runner = CapabilityRunner(self.catalog, self.permissions, self.approvals, self.audit, handlers)
        self.planner = GovernedActionPlanner()
        self.executor = ActionExecutor(self.runner)

    def prepare(self, text: str) -> PreparedAction:
        return self.planner.prepare(text)

    def approve(self, approval_id: str, prepared: PreparedAction) -> None:
        if not prepared.ready or prepared.plan.action is None:
            raise ValueError("Only a prepared action can be approved")
        action = prepared.plan.action
        self.approvals.grant(approval_id, action.name, action.arguments)

    async def execute(self, prepared: PreparedAction, approval_id: str | None = None, *, postcondition: Callable[[Any], bool] | None = None) -> ExecutionResult:
        if not prepared.ready or prepared.plan.action is None:
            return ExecutionResult(False, False, False, prepared.reason or "No action prepared.")
        return await self.executor.execute(GovernedAction(prepared.plan.action, approval_id), postcondition=postcondition)
