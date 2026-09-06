from leo_python.agents.factory import AgentFactory
from leo_python.agents.types import AgentSpec

def test_agent_lifecycle_never_self_authorizes():
    f=AgentFactory()
    spec=f.register_proposal(AgentSpec("research","research",("web.read",)))
    assert not spec.enabled and not spec.owner_approved
    approved=f.approve("research")
    assert approved.enabled and approved.owner_approved
    updated=f.update("research",capabilities=("web.read","memory.read"))
    assert updated.capabilities==("web.read","memory.read")
    disabled=f.disable("research")
    assert not disabled.enabled
    archived=f.archive("research")
    assert not archived.enabled
    assert f.get("research") is None
