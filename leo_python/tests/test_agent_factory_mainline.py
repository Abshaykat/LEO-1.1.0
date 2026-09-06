from leo_python.agents import AgentFactory,AgentSpec
from leo_python.governance import ApprovalStore
def test_agent_lifecycle_requires_owner_approval():
 f=AgentFactory(); a=f.register_proposal(AgentSpec("research","research",("web.read",)))
 assert not a.enabled and not a.owner_approved
 approvals=ApprovalStore(); action={"capability":"agent.approve","parameters":{"name":"research"}}
 approval=approvals.issue("agent-1",action)
 a=f.approve("research",approval.approval_id,approvals)
 assert a.enabled and a.owner_approved
 a=f.update("research",capabilities=("web.read","memory.read")); assert "memory.read" in a.capabilities
 f.disable("research"); assert not f.get("research").enabled
