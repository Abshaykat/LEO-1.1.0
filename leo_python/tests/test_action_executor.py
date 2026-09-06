import pytest
from leo_python.brain.action import ActionCandidate
from leo_python.brain.action_executor import ActionExecutor, GovernedAction

class FakeRunner:
    def __init__(self): self.request=None
    async def run(self, request):
        self.request=request
        return type("Result", (), {"allowed":True,"executed":True,"verified":True})()

@pytest.mark.asyncio
async def test_action_executor_preserves_approval_requirement():
    runner=FakeRunner()
    executor=ActionExecutor(runner)
    candidate=ActionCandidate("system.open", {"raw_text":"Chrome খুলো"}, .9, True)
    await executor.execute(GovernedAction(candidate))
    assert runner.request.requires_approval is True
    assert runner.request.capability=="system.open"
