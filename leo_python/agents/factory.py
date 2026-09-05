from __future__ import annotations
from dataclasses import replace
from .types import AgentSpec
from ..security.policy import ActionPolicy, Risk, evaluate, Decision

class AgentFactory:
    """Controlled agent lifecycle. Creation never silently grants authority."""

    def __init__(self) -> None:
        self._agents: dict[str, AgentSpec] = {}

    def propose(self, spec: AgentSpec) -> AgentSpec:
        if not spec.name.strip() or not spec.purpose.strip():
            raise ValueError("Agent name and purpose are required.")
        if spec.enabled or spec.owner_approved:
            raise ValueError("New agents must begin as unapproved proposals.")
        return spec

    def approve(self, name: str) -> AgentSpec:
        spec = self._agents.get(name)
        if spec is None:
            raise KeyError(name)
        updated = replace(spec, owner_approved=True, enabled=True)
        self._agents[name] = updated
        return updated

    def register_proposal(self, spec: AgentSpec) -> AgentSpec:
        self.propose(spec)
        if spec.name in self._agents:
            raise ValueError(f"Agent already exists: {spec.name}")
        self._agents[spec.name] = spec
        return spec

    def get(self, name: str) -> AgentSpec | None:
        return self._agents.get(name)

    def list(self) -> list[AgentSpec]:
        return list(self._agents.values())
