import pytest
from leo_python.governance import ApprovalStore, ExecutionGuard, AuditSink, Verifier
from leo_python.runtime import ControlledExecutor

@pytest.mark.asyncio
async def test_controlled_executor_requires_approval():
    approvals = ApprovalStore()
    executor = ControlledExecutor(ExecutionGuard(approvals), AuditSink(), Verifier())
    result = await executor.run(None, {"capability":"x"}, lambda _: _ok("done"),
                                requires_approval=True, postcondition=lambda x: x == "done")
    assert not result.executed

@pytest.mark.asyncio
async def test_controlled_executor_verifies_result():
    approvals = ApprovalStore()
    action={"capability":"safe.echo","parameters":{"text":"hello"}}
    approvals.issue("a1", action)
    audit=AuditSink()
    executor=ControlledExecutor(ExecutionGuard(approvals), audit, Verifier())
    result=await executor.run("a1", action, lambda _: _ok("done"),
                              requires_approval=True, postcondition=lambda x: x == "done")
    assert result.executed and result.verified
    assert any(e.event == "execution.verified" for e in audit.events)

async def _ok(value):
    return value
