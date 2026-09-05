from leo_python.brain.types import Intent, Plan, PlanStep
from leo_python.capabilities import Capability, CapabilityRegistry
from leo_python.governance import GovernanceGate

def test_gate_requires_approval_for_actions():
    async def execute(_): return "ok"
    r = CapabilityRegistry()
    r.register(Capability("safe.echo", "safe", execute))
    plan = Plan(Intent("echo", True, .9), (PlanStep("safe.echo", {"text":"hi"}),))
    result = GovernanceGate(r).inspect(plan)
    assert result.allowed and result.requires_owner_approval

def test_gate_rejects_disabled_or_unknown_capability():
    r = CapabilityRegistry()
    plan = Plan(Intent("x", True, .9), (PlanStep("unknown", {}),))
    result = GovernanceGate(r).inspect(plan)
    assert not result.allowed
