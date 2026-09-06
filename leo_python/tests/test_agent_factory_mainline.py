from leo_python.agents import AgentFactory,AgentSpec
def test_agent_lifecycle_starts_unapproved():
 f=AgentFactory(); a=f.register_proposal(AgentSpec("research","research",("web.read",)))
 assert not a.enabled and not a.owner_approved
 a=f.approve("research"); assert a.enabled and a.owner_approved
 a=f.update("research",capabilities=("web.read","memory.read")); assert "memory.read" in a.capabilities
 f.disable("research"); assert not f.get("research").enabled
