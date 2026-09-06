from dataclasses import dataclass
@dataclass(frozen=True)
class StepResult:
    step_id:str; success:bool; output:object=None; error:str|None=None
class WorkflowEngine:
    def __init__(self): self._paused=set(); self._completed={}
    async def run(self,workflow,execute):
        if workflow.id in self._paused: return []
        done=self._completed.setdefault(workflow.id,set()); results=[]
        for step in workflow.steps:
            if workflow.id in self._paused: break
            if step.id in done: continue
            try:
                out=await execute(step.capability,step.parameters)
                results.append(StepResult(step.id,True,out)); done.add(step.id)
            except Exception as e:
                results.append(StepResult(step.id,False,error=str(e))); break
        return results
    def pause(self,workflow_id): self._paused.add(workflow_id)
    def resume(self,workflow_id): self._paused.discard(workflow_id)
