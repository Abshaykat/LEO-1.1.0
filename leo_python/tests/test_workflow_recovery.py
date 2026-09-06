import asyncio
from leo_python.workflow.engine import WorkflowEngine
from leo_python.workflow.types import Workflow, WorkflowStep

def test_workflow_resume_after_failure():
    calls=[]
    attempts={"s1":0}
    async def run(cap, params):
        calls.append(cap)
        if cap=="test.one" and attempts["s1"]==0:
            attempts["s1"]+=1
            raise RuntimeError("temporary failure")
        return params["v"]
    w=Workflow("w2",[WorkflowStep("s1","test.one",{"v":1}),WorkflowStep("s2","test.two",{"v":2})])
    e=WorkflowEngine()
    first=asyncio.run(e.run(w,run))
    assert first[0].success is False
    second=asyncio.run(e.run(w,run))
    assert [x.step_id for x in second]==["s1","s2"]
    assert calls==["test.one","test.one","test.two"]

def test_workflow_pause_is_observed_between_steps():
    calls=[]
    e=WorkflowEngine()
    async def run(cap, params):
        calls.append(cap)
        if cap=="test.one":
            e.pause("w3")
        return params["v"]
    w=Workflow("w3",[WorkflowStep("s1","test.one",{"v":1}),WorkflowStep("s2","test.two",{"v":2})])
    result=asyncio.run(e.run(w,run))
    assert [x.step_id for x in result]==["s1"]
    assert calls==["test.one"]
