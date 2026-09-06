import asyncio, tempfile
from pathlib import Path
from leo_python.capabilities import CapabilityRegistry
from leo_python.capabilities.builtin import register_safe_builtins
from leo_python.runtime.capability_runner import CapabilityRunner, CapabilityRunRequest
from leo_python.governance import ApprovalStore, AuditSink

def test_approved_file_read_is_executed_and_audited():
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/"x.txt"; p.write_text("LEO",encoding="utf-8")
        registry=CapabilityRegistry(); register_safe_builtins(registry)
        approvals=ApprovalStore(); audit=AuditSink()
        runner=CapabilityRunner(registry, approvals, audit)
        action={"capability":"pc.file.read","parameters":{"path":str(p)}}
        approval=approvals.issue("read-1",action)
        result=asyncio.run(runner.run(CapabilityRunRequest("pc.file.read",action["parameters"],approval.approval_id,True,lambda v:v=="LEO")))
        assert result.executed is True and result.verified is True
        assert any(e.event == "execution.completed" for e in audit.events)

def test_tampered_action_cannot_consume_approval():
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/"x.txt"; p.write_text("LEO")
        registry=CapabilityRegistry(); register_safe_builtins(registry)
        approvals=ApprovalStore(); runner=CapabilityRunner(registry,approvals,AuditSink())
        approval=approvals.issue("read-2",{"capability":"pc.file.read","parameters":{"path":str(p)}})
        result=asyncio.run(runner.run(CapabilityRunRequest("pc.file.read",{"path":str(p)+"-tampered"},approval.approval_id,True)))
        assert result.executed is False
