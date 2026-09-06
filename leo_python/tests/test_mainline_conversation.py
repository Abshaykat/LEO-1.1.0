from leo_python.conversation import ConversationRouter
from leo_python.brain.action_pipeline import ActionPipeline
def test_bangla_banglish_and_english_route():
    r=ConversationRouter()
    assert r.route("কাজ চালাও").language=="bn"
    assert r.route("kaj chalao").language=="en"
    assert r.route("kaj চালাও").language=="banglish"
def test_action_planning_does_not_execute():
    p=ActionPipeline().plan("চালাও PowerShell")
    assert p.action is not None
