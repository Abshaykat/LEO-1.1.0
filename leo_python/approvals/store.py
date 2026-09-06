from __future__ import annotations
from dataclasses import dataclass
from hashlib import sha256
from typing import Any, Mapping
import json

@dataclass(frozen=True)
class Approval:
    id: str
    action_hash: str
    approved: bool

def action_hash(capability: str, parameters: Mapping[str, Any]) -> str:
    payload = json.dumps({"capability": capability, "parameters": parameters}, sort_keys=True, default=str, separators=(",", ":"))
    return sha256(payload.encode()).hexdigest()

class ApprovalStore:
    def __init__(self) -> None:
        self._approvals: dict[str, Approval] = {}
    def grant(self, approval_id: str, capability: str, parameters: Mapping[str, Any]) -> Approval:
        approval = Approval(approval_id, action_hash(capability, parameters), True)
        self._approvals[approval_id] = approval
        return approval
    def valid_for(self, approval_id: str | None, capability: str, parameters: Mapping[str, Any]) -> bool:
        return bool(approval_id and (approval := self._approvals.get(approval_id)) and approval.approved and approval.action_hash == action_hash(capability, parameters))
