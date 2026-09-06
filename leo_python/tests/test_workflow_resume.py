import asyncio
from leo_python.workflow.engine import WorkflowEngine
from leo_python.workflow.types import Workflow, WorkflowStep

def test_workflow_pause_resume_skips_completed_steps():
    calls=[]
    async def run(cap, params):
        calls.append(cap); return params["v"]
    w=Workflow("w1",[WorkflowStep("s1","test.one",{"v":1}),WorkflowStep("s2","test.two",{"v":2})])
    e=WorkflowEngine()
    first=asyncio.run(e.run(w,run))
    assert [x.step_id for x in first]==["s1","s2"]
    e.pause("w1")
    assert asyncio.run(e.run(w,run))==[]
    e.resume("w1")
    second=asyncio.run(e.run(w,run))
    assert second==[]
    assert calls==["test.one","test.two"]
