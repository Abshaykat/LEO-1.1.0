from leo_python.brain.action_pipeline import ActionPipeline

def test_banglish_action_becomes_capability_candidate():
    result=ActionPipeline().plan("Chrome ta open koro")
    assert result.action is not None
    assert result.action.name=="system.open"
    assert result.action.requires_approval

def test_question_does_not_become_action():
    result=ActionPipeline().plan("What is LEO?")
    assert result.action is None
