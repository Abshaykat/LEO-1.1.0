from __future__ import annotations
from dataclasses import dataclass, replace
from datetime import datetime, timedelta, timezone
from threading import RLock
from typing import Any
from .action_hash import action_hash

@dataclass(frozen=True)
class Approval:
    id: str
    tool_name: str
    parameters: Any
    action_hash: str
    reason: str
    created_at: datetime
    expires_at: datetime
    status: str = "pending"

class ApprovalStore:
    def __init__(self) -> None:
        self._items: dict[str, Approval] = {}
        self._lock = RLock()

    def save(self, approval: Approval) -> None:
        with self._lock:
            self._items[approval.id] = approval

    def get(self, approval_id: str) -> Approval | None:
        with self._lock:
            return self._items.get(approval_id)

    def replace(self, approval: Approval) -> None:
        self.save(approval)

def approve(store: ApprovalStore, approval_id: str) -> Approval:
    item = store.get(approval_id)
    if item is None:
        raise ValueError("Approval request not found.")
    if item.status != "pending":
        raise ValueError(f"Approval request is {item.status}.")
    if datetime.now(timezone.utc) >= item.expires_at:
        raise ValueError("Approval request has expired.")
    updated = replace(item, status="approved")
    store.replace(updated)
    return updated

def reject(store: ApprovalStore, approval_id: str) -> Approval:
    item = store.get(approval_id)
    if item is None:
        raise ValueError("Approval request not found.")
    if item.status != "pending":
        raise ValueError(f"Approval request is {item.status}.")
    updated = replace(item, status="rejected")
    store.replace(updated)
    return updated

def consume(store: ApprovalStore, approval_id: str, tool_name: str, parameters: Any) -> Approval:
    item = store.get(approval_id)
    if item is None:
        raise ValueError("Approval request not found.")
    if item.status != "approved":
        raise ValueError(f"Approval is not executable: {item.status}.")
    if datetime.now(timezone.utc) >= item.expires_at:
        raise ValueError("Approval request has expired.")
    if item.tool_name != tool_name:
        raise ValueError("Approved tool does not match execution tool.")
    if item.action_hash != action_hash(tool_name, parameters):
        raise ValueError("Approved parameters do not match the approved action.")
    updated = replace(item, status="consumed")
    store.replace(updated)
    return updated
