from __future__ import annotations
from dataclasses import replace
from .types import AgentSpec
from ..governance.approval import ApprovalStore
class AgentFactory:
    """Owner-controlled agent lifecycle. Deployment always consumes a matching approval."""
    def __init__(self) -> None: self._agents: dict[str,AgentSpec]={}
    def propose(self,spec:AgentSpec)->AgentSpec:
        if not spec.name.strip() or not spec.purpose.strip(): raise ValueError("Agent name and purpose are required.")
        if spec.enabled or spec.owner_approved: raise ValueError("New agents must begin as unapproved proposals.")
        if any(not c.strip() for c in spec.capabilities): raise ValueError("Capability names must be non-empty.")
        return spec
    def register_proposal(self,spec:AgentSpec)->AgentSpec:
        self.propose(spec)
        if spec.name in self._agents: raise ValueError(f"Agent already exists: {spec.name}")
        self._agents[spec.name]=spec; return spec
    def approve(self,name:str,approval_id:str,approvals:ApprovalStore)->AgentSpec:
        spec=self._agents[name]
        action={"capability":"agent.create","parameters":{"name":name,"purpose":spec.purpose,"capabilities":list(spec.capabilities)}}
        if not approval_id or not approvals.consume(approval_id,action): raise PermissionError("Matching owner approval is required.")
        updated=replace(spec,owner_approved=True,enabled=True); self._agents[name]=updated; return updated
    def update(self,name:str,*,capabilities:tuple[str,...]|None=None,memory_scope:str|None=None,purpose:str|None=None)->AgentSpec:
        spec=self._agents[name]
        if not spec.owner_approved: raise PermissionError("Only an approved agent can be updated.")
        if capabilities is not None and any(not c.strip() for c in capabilities): raise ValueError("Capability names must be non-empty.")
        updated=replace(spec,capabilities=capabilities if capabilities is not None else spec.capabilities,memory_scope=memory_scope if memory_scope is not None else spec.memory_scope,purpose=purpose if purpose is not None else spec.purpose)
        self._agents[name]=updated; return updated
    def disable(self,name:str)->AgentSpec:
        updated=replace(self._agents[name],enabled=False); self._agents[name]=updated; return updated
    def archive(self,name:str)->AgentSpec:
        return replace(self._agents.pop(name),enabled=False)
    def get(self,name:str)->AgentSpec|None: return self._agents.get(name)
    def list(self)->list[AgentSpec]: return list(self._agents.values())
