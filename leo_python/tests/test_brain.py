import pytest
from leo_python.brain import StructuredPlanner
from leo_python.capabilities import Capability, CapabilityRegistry

def test_planner_rejects_unknown_capability():
    r = CapabilityRegistry()
    with pytest.raises(ValueError):
        StructuredPlanner(r).parse('{"intent":{"goal":"x","action":true},"steps":[{"capability":"unknown"}]}')

def test_planner_accepts_registered_capability():
    async def execute(_): return "ok"
    r = CapabilityRegistry()
    r.register(Capability("safe.echo", "test", execute))
    plan = StructuredPlanner(r).parse(
        '{"intent":{"goal":"say hello","action":true,"confidence":0.9},'
        '"steps":[{"capability":"safe.echo","parameters":{"text":"hello"},'
        '"expected_outcome":"echo hello"}]}'
    )
    assert plan.intent.confidence == 0.9
    assert plan.steps[0].capability == "safe.echo"
