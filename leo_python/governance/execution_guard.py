from dataclasses import dataclass
@dataclass(frozen=True)
class ExecutionDecision:
    allowed:bool; reason:str
class ExecutionGuard:
    def __init__(self,approvals): self.approvals=approvals
    def authorize(self,approval_id,action,*,requires_approval):
        if not requires_approval: return ExecutionDecision(True,"No approval required.")
        if not approval_id: return ExecutionDecision(False,"Owner approval is required.")
        if not self.approvals.consume(approval_id,action):
            return ExecutionDecision(False,"Approval missing, already consumed, or action changed.")
        return ExecutionDecision(True,"Approved action integrity verified.")
