import asyncio
from leo_python.workflow import Workflow,WorkflowStep,WorkflowEngine
def test_workflow_pause_resume_and_no_repeat():
    calls=[]
    async def execute(cap,params): calls.append(cap); return params["v"]
    w=Workflow("w1","test",(WorkflowStep("s1","x",{"v":1}),WorkflowStep("s2","y",{"v":2})))
    e=WorkflowEngine()
    first=asyncio.run(e.run(w,execute))
    assert [x.step_id for x in first]==["s1","s2"]
    e.pause("w1"); assert asyncio.run(e.run(w,execute))==[]
    e.resume("w1"); assert asyncio.run(e.run(w,execute))==[]
    assert calls==["x","y"]
