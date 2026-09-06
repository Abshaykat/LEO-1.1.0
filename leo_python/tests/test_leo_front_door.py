from leo_python.brain.leo import Leo, LeoRequest
from leo_python.capabilities.registry import CapabilityRegistry, CapabilityDescriptor

def test_front_door_is_pure_python_and_non_executing():
    registry=CapabilityRegistry()
    registry.register(CapabilityDescriptor(name="pc.read_file", enabled=True))
    leo=Leo(registry)
    result=leo.prepare(LeoRequest("file ta poro"), '{"intent":{"goal":"read","action":true,"confidence":0.9},"steps":[{"capability":"pc.read_file","parameters":{"path":"D:/LEO/a.txt"},"requires_approval":true,"expected_outcome":"content"}]}')
    assert result.plan.steps[0].requires_approval is True
    assert leo.conversational_response(" hi ").text=="hi"
