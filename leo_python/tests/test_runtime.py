import pytest
from leo_python.runtime.leo import LeoRuntime

@pytest.mark.asyncio
async def test_runtime_requires_matching_owner_approval_and_audits_execution():
    calls = []
    async def open_app(parameters):
        calls.append(parameters)
        return "opened"
    runtime = LeoRuntime({"system.open": open_app})
    prepared = runtime.prepare("Chrome ta open koro")
    denied = await runtime.execute(prepared)
    assert not denied.executed
    runtime.approve("owner-1", prepared)
    result = await runtime.execute(prepared, "owner-1", postcondition=lambda value: value == "opened")
    assert result.executed and result.verified
    assert calls and runtime.audit.events[-1].event == "executed"

@pytest.mark.asyncio
async def test_tampered_parameters_invalidate_approval():
    async def open_app(parameters): return parameters
    runtime = LeoRuntime({"system.open": open_app})
    prepared = runtime.prepare("open Chrome")
    runtime.approve("owner-1", prepared)
    prepared.plan.action.arguments["raw_text"] = "open destructive app"
    result = await runtime.execute(prepared, "owner-1")
    assert not result.executed
