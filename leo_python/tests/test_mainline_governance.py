import asyncio,tempfile
from pathlib import Path
from leo_python.capabilities import CapabilityRegistry
from leo_python.capabilities.builtin import register_safe_builtins
from leo_python.governance import ApprovalStore,AuditSink
from leo_python.runtime import CapabilityRunner,CapabilityRunRequest

def test_real_file_read_requires_and_consumes_approval():
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/"x.txt"; p.write_text("LEO-REAL-READ",encoding="utf8")
        reg=CapabilityRegistry(); register_safe_builtins(reg); approvals=ApprovalStore(); audit=AuditSink()
        runner=CapabilityRunner(reg,approvals,audit)
        action={"capability":"pc.file.read","parameters":{"path":str(p)}}
        approval=approvals.issue("a1",action)
        result=asyncio.run(runner.run(CapabilityRunRequest("pc.file.read",action["parameters"],approval.approval_id,True,lambda v:v=="LEO-REAL-READ")))
        assert result.allowed and result.executed and result.verified
        again=asyncio.run(runner.run(CapabilityRunRequest("pc.file.read",action["parameters"],approval.approval_id,True)))
        assert not again.executed

def test_tampered_action_is_rejected():
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/"x.txt"; p.write_text("ok")
        reg=CapabilityRegistry(); register_safe_builtins(reg); approvals=ApprovalStore()
        runner=CapabilityRunner(reg,approvals)
        action={"capability":"pc.file.read","parameters":{"path":str(p)}}
        a=approvals.issue("a2",action)
        result=asyncio.run(runner.run(CapabilityRunRequest("pc.file.read",{"path":str(p)+"-changed"},a.approval_id,True)))
        assert not result.executed
