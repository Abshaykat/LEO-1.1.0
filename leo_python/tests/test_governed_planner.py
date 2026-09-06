from leo_python.brain.governed_planner import GovernedActionPlanner

def test_prepare_never_executes():
    result=GovernedActionPlanner().prepare("Chrome ta open koro")
    assert result.ready
    assert result.plan.action is not None

def test_non_action_is_not_ready():
    result=GovernedActionPlanner().prepare("What is LEO?")
    assert not result.ready
