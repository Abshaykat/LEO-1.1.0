from dataclasses import dataclass
from .types import AgentSpec
from .factory import AgentFactory
@dataclass(frozen=True)
class WorkforceRole:
    name:str; purpose:str; capabilities:tuple[str,...]
DEFAULT_ROLES=(
 WorkforceRole("research","Research and information gathering",("web.read","memory.read")),
 WorkforceRole("browser","Controlled browser interaction",("browser.read","browser.navigate")),
 WorkforceRole("coding","Software development assistance",("workspace.read","workspace.write")),
 WorkforceRole("system","Controlled computer assistance",("pc.read",)),
 WorkforceRole("office","Document assistance",("office.read","office.write")),
 WorkforceRole("data","Data processing",("data.read","data.transform")),
 WorkforceRole("marketing","Marketing assistance",("web.read","data.read")),
 WorkforceRole("trading","Market research and risk-aware analysis",("market.read","data.read")),
)
class Workforce:
 def __init__(self,factory:AgentFactory): self.factory=factory
 def propose_role(self,role): return self.factory.register_proposal(AgentSpec(role.name,role.purpose,role.capabilities))
 def propose_defaults(self): return [self.propose_role(r) for r in DEFAULT_ROLES]
