from leo_python.agents.factory import AgentFactory
from leo_python.agents.types import AgentSpec
from leo_python.governance.approval import ApprovalStore
def test_agent_lifecycle_requires_owner_approval():
    f=AgentFactory(); spec=f.register_proposal(AgentSpec("research","research",("web.read",)))
    assert not spec.enabled and not spec.owner_approved
    approvals=ApprovalStore()
    action={"capability":"agent.create","parameters":{"name":"research","purpose":"research","capabilities":["web.read"]}}
    approval=approvals.issue("agent-1",action)
    approved=f.approve("research",approval.approval_id,approvals)
    assert approved.enabled and approved.owner_approved
    updated=f.update("research",capabilities=("web.read","memory.read"))
    assert updated.capabilities==("web.read","memory.read")
    assert not f.disable("research").enabled
    assert not f.archive("research").enabled
    assert f.get("research") is None
