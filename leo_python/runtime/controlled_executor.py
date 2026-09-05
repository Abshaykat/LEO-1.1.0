from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Awaitable, Callable
from ..governance import AuditSink, ExecutionGuard, Verifier

@dataclass(frozen=True)
class ExecutionResult:
    allowed: bool
    executed: bool
    verified: bool
    value: Any = None
    reason: str = ""

class ControlledExecutor:
    """Executes only an already-registered callable after governance checks."""

    def __init__(self, guard: ExecutionGuard, audit: AuditSink, verifier: Verifier) -> None:
        self.guard = guard
        self.audit = audit
        self.verifier = verifier

    async def run(
        self,
        approval_id: str | None,
        action: dict[str, Any],
        execute: Callable[[dict[str, Any]], Awaitable[Any]],
        *,
        requires_approval: bool,
        postcondition: Callable[[Any], bool] | None,
    ) -> ExecutionResult:
        decision = self.guard.authorize(
            approval_id, action, requires_approval=requires_approval
        )
        if not decision.allowed:
            self.audit.record("execution.rejected", action_hash=self.guard.approvals.action_hash(action), reason=decision.reason)
            return ExecutionResult(False, False, False, reason=decision.reason)

        action_hash = self.guard.approvals.action_hash(action)
        self.audit.record("execution.started", action_hash=action_hash)
        try:
            value = await execute(action)
        except Exception as exc:
            self.audit.record("execution.failed", action_hash=action_hash, error=str(exc))
            return ExecutionResult(True, False, False, reason=f"Execution failed: {exc}")

        verification = self.verifier.verify(value, postcondition)
        self.audit.record(
            "execution.verified" if verification.verified else "execution.unverified",
            action_hash=action_hash,
            reason=verification.reason,
        )
        return ExecutionResult(True, True, verification.verified, value, verification.reason)
