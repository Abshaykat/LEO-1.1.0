from dataclasses import dataclass
from enum import Enum
class Risk(str,Enum): LOW="low"; MEDIUM="medium"; HIGH="high"; CRITICAL="critical"
class Decision(str,Enum): ALLOW="allow"; REQUIRE_APPROVAL="require_approval"; DENY="deny"
@dataclass(frozen=True)
class ActionPolicy:
    name:str; risk:Risk; requires_approval:bool=False; destructive:bool=False; external_effect:bool=False; creates_agent:bool=False; changes_permissions:bool=False
def evaluate(p:ActionPolicy):
    if p.changes_permissions or p.creates_agent or p.external_effect or p.destructive or p.requires_approval: return Decision.REQUIRE_APPROVAL,"Explicit owner approval required."
    return Decision.ALLOW,"Policy allows action."
