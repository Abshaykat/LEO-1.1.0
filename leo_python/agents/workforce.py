from __future__ import annotations
from dataclasses import dataclass
from .types import AgentSpec
from .factory import AgentFactory

@dataclass(frozen=True)
class WorkforceRole:
    name: str
    purpose: str
    capabilities: tuple[str, ...]

DEFAULT_ROLES = (
    WorkforceRole("research", "Research and information gathering", ("web.read", "memory.read")),
    WorkforceRole("browser", "Controlled browser interaction", ("browser.read", "browser.navigate")),
    WorkforceRole("coding", "Software development assistance", ("workspace.read", "workspace.write")),
    WorkforceRole("system", "Controlled computer and system assistance", ("pc.read",)),
    WorkforceRole("office", "Document and spreadsheet assistance", ("office.read", "office.write")),
    WorkforceRole("data", "Data processing and analysis", ("data.read", "data.transform")),
    WorkforceRole("marketing", "Marketing research and campaign assistance", ("web.read", "data.read")),
    WorkforceRole("trading", "Market research and risk-aware analysis", ("market.read", "data.read")),
)

class Workforce:
    """Creates role proposals only. Deployment remains owner-approved through AgentFactory."""
    def __init__(self, factory: AgentFactory) -> None:
        self.factory = factory

    def propose_role(self, role: WorkforceRole) -> AgentSpec:
        spec = AgentSpec(role.name, role.purpose, role.capabilities)
        return self.factory.register_proposal(spec)

    def propose_defaults(self) -> list[AgentSpec]:
        return [self.propose_role(role) for role in DEFAULT_ROLES]
