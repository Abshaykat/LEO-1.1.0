from leo_python.brain.governed_brain import GovernedBrain
from leo_python.capabilities.registry import CapabilityRegistry, CapabilityDescriptor

def test_governed_brain_plans_without_execution():
    registry=CapabilityRegistry()
    registry.register(CapabilityDescriptor(name="pc.read_file", enabled=True))
    brain=GovernedBrain(registry)
    result=brain.prepare(
        "file ta poro",
        '{"intent":{"goal":"read file","action":true,"confidence":0.9},"steps":[{"capability":"pc.read_file","parameters":{"path":"D:/LEO/a.txt"},"requires_approval":true,"expected_outcome":"file content"}]}'
    )
    assert result.plan.steps[0].capability=="pc.read_file"
    assert result.plan.steps[0].requires_approval is True
    assert "owner approval" in result.system_prompt
