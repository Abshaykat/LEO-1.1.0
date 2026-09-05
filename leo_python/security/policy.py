from __future__ import annotations
from dataclasses import dataclass
from enum import Enum

class Risk(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Decision(str, Enum):
    ALLOW = "allow"
    REQUIRE_APPROVAL = "require_approval"
    DENY = "deny"

@dataclass(frozen=True)
class ActionPolicy:
    name: str
    risk: Risk
    requires_approval: bool = False
    destructive: bool = False
    external_effect: bool = False
    creates_agent: bool = False
    changes_permissions: bool = False

def evaluate(policy: ActionPolicy) -> tuple[Decision, str]:
    if policy.changes_permissions:
        return Decision.REQUIRE_APPROVAL, "Permission changes require explicit owner approval."
    if policy.creates_agent:
        return Decision.REQUIRE_APPROVAL, "Agent creation requires explicit owner approval."
    if policy.external_effect:
        return Decision.REQUIRE_APPROVAL, "External effects require explicit owner approval."
    if policy.destructive:
        return Decision.REQUIRE_APPROVAL, "Destructive actions require explicit owner approval."
    if policy.requires_approval:
        return Decision.REQUIRE_APPROVAL, "This action requires explicit owner approval."
    return Decision.ALLOW, "Action satisfies the current L.E.O. policy."
