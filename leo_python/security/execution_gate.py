from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Awaitable, Callable
from uuid import uuid4
from .approval import ApprovalStore, Approval, consume
from .policy import ActionPolicy, Decision, evaluate
from ..config import CONFIG

@dataclass(frozen=True)
class ExecutionRequest:
    tool_name: str
    parameters: Any
    reason: str
    owner_authenticated: bool
    policy: ActionPolicy
    approval_id: str | None = None

@dataclass(frozen=True)
class ApprovalRequired:
    approval_id: str
    reason: str

async def execute(
    request: ExecutionRequest,
    store: ApprovalStore,
    executor: Callable[[str, Any], Awaitable[Any]],
) -> Any | ApprovalRequired:
    if not request.owner_authenticated:
        raise PermissionError("Owner authentication is required.")

    decision, reason = evaluate(request.policy)
    if decision is Decision.DENY:
        raise PermissionError(reason)

    if decision is Decision.REQUIRE_APPROVAL:
        if request.approval_id is None:
            now = datetime.now(timezone.utc)
            approval = Approval(
                id=str(uuid4()),
                tool_name=request.tool_name,
                parameters=request.parameters,
                action_hash=__import__("leo_python.security.action_hash", fromlist=["action_hash"]).action_hash(request.tool_name, request.parameters),
                reason=request.reason,
                created_at=now,
                expires_at=now + timedelta(seconds=CONFIG.approval_ttl_seconds),
            )
            store.save(approval)
            return ApprovalRequired(approval.id, reason)
        consume(store, request.approval_id, request.tool_name, request.parameters)

    return await executor(request.tool_name, request.parameters)
