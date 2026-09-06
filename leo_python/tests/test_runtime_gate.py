import asyncio
from leo_python.capabilities import Capability,CapabilityRegistry
from leo_python.governance import ApprovalStore,AuditSink
from leo_python.runtime import CapabilityRunner,CapabilityRunRequest

def test_runner_denies_missing_approval_and_audits():
    async def work(a): return "SHOULD NOT RUN"
    reg=CapabilityRegistry(); reg.register(Capability("test.safe","safe",work))
    audit=AuditSink(); runner=CapabilityRunner(reg,ApprovalStore(),audit)
    result=asyncio.run(runner.run(CapabilityRunRequest("test.safe",{},None,True)))
    assert not result.executed
    assert any(e.event=="execution.rejected" for e in audit.events)

def test_runner_executes_and_verifies_after_approval():
    async def work(a): return "OK"
    reg=CapabilityRegistry(); reg.register(Capability("test.safe","safe",work))
    approvals=ApprovalStore(); runner=CapabilityRunner(reg,approvals)
    action={"capability":"test.safe","parameters":{}}
    approval=approvals.issue("ok-1",action)
    result=asyncio.run(runner.run(CapabilityRunRequest("test.safe",{},approval.approval_id,True,lambda x:x=="OK")))
    assert result.executed and result.verified
