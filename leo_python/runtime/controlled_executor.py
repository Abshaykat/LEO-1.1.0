from dataclasses import dataclass
@dataclass(frozen=True)
class ExecutionResult:
    allowed:bool; executed:bool; verified:bool; value:object=None; reason:str=""
class ControlledExecutor:
    def __init__(self,guard,audit,verifier): self.guard=guard; self.audit=audit; self.verifier=verifier
    async def run(self,approval_id,action,execute,*,requires_approval,postcondition):
        decision=self.guard.authorize(approval_id,action,requires_approval=requires_approval)
        h=self.guard.approvals.action_hash(action)
        if not decision.allowed:
            self.audit.record("execution.rejected",action_hash=h,reason=decision.reason); return ExecutionResult(False,False,False,reason=decision.reason)
        self.audit.record("execution.started",action_hash=h)
        try: value=await execute(action)
        except Exception as e:
            self.audit.record("execution.failed",action_hash=h,error=str(e)); return ExecutionResult(True,False,False,reason=f"Execution failed: {e}")
        v=self.verifier.verify(value,postcondition); self.audit.record("execution.verified" if v.verified else "execution.unverified",action_hash=h,reason=v.reason)
        return ExecutionResult(True,True,v.verified,value,v.reason)
