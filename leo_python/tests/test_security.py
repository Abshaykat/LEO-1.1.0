import asyncio
from leo_python.security.action_hash import action_hash
from leo_python.security.approval import ApprovalStore, approve, consume
from leo_python.security.execution_gate import ExecutionRequest, ApprovalRequired, execute
from leo_python.security.policy import ActionPolicy, Risk
from leo_python.communication.language import detect_language

def test_action_hash_is_stable():
    assert action_hash("x", {"b": 2, "a": 1}) == action_hash("x", {"a": 1, "b": 2})

def test_approval_binds_parameters_and_is_one_time():
    async def run():
        store = ApprovalStore()
        policy = ActionPolicy("file.delete", Risk.HIGH, destructive=True)
        request = ExecutionRequest("file.delete", {"path": "a"}, "cleanup", True, policy)
        first = await execute(request, store, lambda *_: asyncio.sleep(0))
        assert isinstance(first, ApprovalRequired)
        approve(store, first.approval_id)
        await execute(ExecutionRequest("file.delete", {"path": "a"}, "cleanup", True, policy, first.approval_id), store, lambda *_: asyncio.sleep(0))
        try:
            await execute(ExecutionRequest("file.delete", {"path": "b"}, "cleanup", True, policy, first.approval_id), store, lambda *_: asyncio.sleep(0))
        except ValueError:
            return
        raise AssertionError("Approval was not bound to the original parameters.")
    asyncio.run(run())

def test_owner_authentication():
    async def run():
        store = ApprovalStore()
        policy = ActionPolicy("x", Risk.LOW)
        try:
            await execute(ExecutionRequest("x", {}, "test", False, policy), store, lambda *_: asyncio.sleep(0))
        except PermissionError:
            return
        raise AssertionError("Unauthenticated execution was allowed.")
    asyncio.run(run())

def test_language_detection():
    assert detect_language("Open Chrome") == "english"
    assert detect_language("ক্রোমটা খুলে দাও") == "bangla"
    assert detect_language("Chrome টা open koro") == "mixed"
