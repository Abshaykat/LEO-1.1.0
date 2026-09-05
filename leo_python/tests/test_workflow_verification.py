import asyncio
from leo_python.verification import verify
from leo_python.workflow import Workflow, WorkflowEngine, WorkflowStep

def test_verification():
    assert verify(lambda: True, description="expected state").verified
    assert not verify(lambda: False, description="expected state").verified

def test_workflow_runs_steps():
    async def run():
        seen = []
        async def execute(name, params):
            seen.append((name, params))
            return "ok"
        wf = Workflow("w1", "demo", (WorkflowStep("s1", "x", {"a": 1}),))
        result = await WorkflowEngine().run(wf, execute)
        assert result[0].success and seen == [("x", {"a": 1})]
    asyncio.run(run())
