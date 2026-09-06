from dataclasses import dataclass
@dataclass(frozen=True)
class ExecutionDecision:
    allowed:bool; reason:str
class ExecutionGuard:
    def __init__(self,approvals): self.approvals=approvals
    def authorize(self,approval_id,action,*,requires_approval):
        if not requires_approval: return ExecutionDecision(True,"No approval required.")
        if not approval_id: return ExecutionDecision(False,"Owner approval is required.")
        return ExecutionDecision(self.approvals.consume(approval_id,action),"Approved action integrity verified." if self.approvals.action_hash(action) else "Approval invalid.")
