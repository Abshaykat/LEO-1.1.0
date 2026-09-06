import asyncio
from leo_python.runtime.governed_runtime import GovernedPythonRuntime
from leo_python.runtime.python_runtime import RuntimeDecision, RequestKind
from leo_python.runtime.capability_runner import CapabilityRunRequest
from leo_python.capabilities import CapabilityRegistry, CapabilityDescriptor
from leo_python.governance.approval import ApprovalStore

class EchoCapability:
    name="test.echo"
    async def execute(self, action): return action["parameters"]["value"]

def test_governed_runtime_rejects_unapproved_action():
    registry=CapabilityRegistry()
    registry.register(CapabilityDescriptor(name="test.echo", enabled=True, execute=EchoCapability().execute))
    runtime=GovernedPythonRuntime(registry, ApprovalStore())
    decision=RuntimeDecision(RequestKind.ACTION, type("P",(),{"steps":[type("S",(),{"capability":"test.echo","parameters":{"value":"ok"},"requires_approval":True})()]})())
    result=asyncio.run(runtime.execute_prepared(decision))
    assert result.execution.executed is False

def test_governed_runtime_executes_after_matching_approval():
    registry=CapabilityRegistry()
    registry.register(CapabilityDescriptor(name="test.echo", enabled=True, execute=EchoCapability().execute))
    approvals=ApprovalStore(); runtime=GovernedPythonRuntime(registry, approvals)
    action={"capability":"test.echo","parameters":{"value":"ok"}}
    approval=approvals.issue("a1", action)
    decision=RuntimeDecision(RequestKind.ACTION, type("P",(),{"steps":[type("S",(),{"capability":"test.echo","parameters":{"value":"ok"},"requires_approval":True})()]})())
    result=asyncio.run(runtime.execute_prepared(decision, approval_id=approval.approval_id))
    assert result.execution.executed is True
    assert result.execution.value=="ok"
