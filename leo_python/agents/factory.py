from dataclasses import replace
from .types import AgentSpec
class AgentFactory:
    def __init__(self): self._agents={}
    def propose(self,spec):
        if not spec.name.strip() or not spec.purpose.strip(): raise ValueError("Agent name and purpose are required.")
        if spec.enabled or spec.owner_approved: raise ValueError("New agents must begin unapproved.")
        if any(not c.strip() for c in spec.capabilities): raise ValueError("Capability names must be non-empty.")
        return spec
    def register_proposal(self,spec):
        self.propose(spec)
        if spec.name in self._agents: raise ValueError("Agent already exists.")
        self._agents[spec.name]=spec; return spec
    def approve(self,name,approval_id,approvals):
        spec=self._agents[name]
        action={"capability":"agent.approve","parameters":{"name":name}}
        if not approval_id or not approvals.consume(approval_id,action):
            raise PermissionError("Owner approval is required for agent deployment.")
        self._agents[name]=replace(spec,owner_approved=True,enabled=True); return self._agents[name]
    def update(self,name,**changes):
        spec=self._agents[name]
        if not spec.owner_approved: raise PermissionError("Agent requires owner approval before update.")
        allowed={k:v for k,v in changes.items() if k in {"purpose","capabilities","memory_scope"} and v is not None}
        if "capabilities" in allowed and any(not c.strip() for c in allowed["capabilities"]): raise ValueError("Capability names must be non-empty.")
        self._agents[name]=replace(spec,**allowed); return self._agents[name]
    def disable(self,name): self._agents[name]=replace(self._agents[name],enabled=False); return self._agents[name]
    def archive(self,name): return replace(self._agents.pop(name),enabled=False)
    def get(self,name): return self._agents.get(name)
