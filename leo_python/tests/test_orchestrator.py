import pytest
from leo_python.brain import BrainOrchestrator
from leo_python.brain.router import BrainRouter
from leo_python.capabilities import Capability, CapabilityRegistry

class FakeProvider:
    name = "local"

def test_orchestrator_never_executes():
    async def execute(_): raise AssertionError("must not execute")
    registry = CapabilityRegistry()
    registry.register(Capability("safe.echo", "safe", execute))
    o = BrainOrchestrator(registry, BrainRouter([FakeProvider()]))
    decision = o.prepare("Chrome ta open koro")
    assert decision.plan is None
    assert decision.needs_approval

def test_accept_plan_rejects_unknown_capability():
    registry = CapabilityRegistry()
    o = BrainOrchestrator(registry, BrainRouter([FakeProvider()]))
    with pytest.raises(ValueError):
        o.accept_plan("do it", '{"intent":{"goal":"x","action":true}, "steps":[{"capability":"unknown"}]}')
