from leo_python.brain.fast_path import FastPath
from leo_python.brain.latency import LatencyBudget
from leo_python.brain.latency_policy import decide

def test_budget_is_three_seconds():
    budget = LatencyBudget()
    budget.validate()
    assert budget.total_ms == 3000

def test_fast_path():
    result = FastPath().try_handle("হাই")
    assert result.handled

def test_timeout_never_claims_success():
    result = decide(3001)
    assert result.timed_out
    assert "claim completion" in result.fallback
