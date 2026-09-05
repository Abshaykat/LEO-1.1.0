from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .approval import ApprovalStore

@dataclass(frozen=True)
class ExecutionDecision:
    allowed: bool
    reason: str

class ExecutionGuard:
    """Final approval/action-integrity guard. It never executes code itself."""

    def __init__(self, approvals: ApprovalStore) -> None:
        self.approvals = approvals

    def authorize(self, approval_id: str | None, action: dict[str, Any], *,
                  requires_approval: bool) -> ExecutionDecision:
        if not requires_approval:
            return ExecutionDecision(True, "No owner approval required by policy.")
        if not approval_id:
            return ExecutionDecision(False, "Owner approval is required.")
        if not self.approvals.consume(approval_id, action):
            return ExecutionDecision(False, "Approval missing, already consumed, or action changed.")
        return ExecutionDecision(True, "Approved action integrity verified.")
