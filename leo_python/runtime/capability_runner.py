from dataclasses import dataclass
from ..governance import AuditSink,ApprovalStore,ExecutionGuard,Verifier
from .controlled_executor import ControlledExecutor
@dataclass(frozen=True)
class CapabilityRunRequest:
    capability:str; parameters:dict; approval_id:str|None=None; requires_approval:bool=False; postcondition:object=None
class CapabilityRunner:
    def __init__(self,registry,approvals,audit=None):
        self.registry=registry; self.approvals=approvals; self.audit=audit or AuditSink(); self.executor=ControlledExecutor(ExecutionGuard(approvals),self.audit,Verifier())
    async def run(self,r):
        c=self.registry.get(r.capability)
        if c is None: self.audit.record("capability.rejected",capability=r.capability); return __import__("leo_python.runtime.controlled_executor",fromlist=["ExecutionResult"]).ExecutionResult(False,False,False,reason="Capability unavailable.")
        return await self.executor.run(r.approval_id,{"capability":r.capability,"parameters":r.parameters},c.executor,requires_approval=r.requires_approval,postcondition=r.postcondition)
