from leo_python.agents.factory import AgentFactory
from leo_python.agents.workforce import Workforce, DEFAULT_ROLES

def test_workforce_only_proposes_disabled_agents():
    f=AgentFactory()
    proposals=Workforce(f).propose_defaults()
    assert len(proposals)==len(DEFAULT_ROLES)
    assert all(not p.enabled and not p.owner_approved for p in proposals)
    assert len(f.list())==len(DEFAULT_ROLES)
