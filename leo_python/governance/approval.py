from __future__ import annotations
from dataclasses import dataclass
from hashlib import sha256
import json
import time
from typing import Any

@dataclass(frozen=True)
class Approval:
    approval_id: str
    action_hash: str
    approved_at: float
    consumed: bool = False

class ApprovalStore:
    """In-memory approval primitive; persistence must be added behind the same API."""

    def __init__(self) -> None:
        self._items: dict[str, Approval] = {}

    @staticmethod
    def action_hash(action: dict[str, Any]) -> str:
        payload = json.dumps(action, sort_keys=True, separators=(",", ":")).encode()
        return sha256(payload).hexdigest()

    def issue(self, approval_id: str, action: dict[str, Any]) -> Approval:
        digest = self.action_hash(action)
        approval = Approval(approval_id, digest, time.time())
        self._items[approval_id] = approval
        return approval

    def consume(self, approval_id: str, action: dict[str, Any]) -> bool:
        current = self._items.get(approval_id)
        if current is None or current.consumed:
            return False
        if current.action_hash != self.action_hash(action):
            return False
        self._items[approval_id] = Approval(
            current.approval_id, current.action_hash, current.approved_at, True
        )
        return True
