from leo_python.brain import BrainPipeline
from leo_python.brain.router import BrainRouter
from leo_python.conversation import ConversationRouter

class FakeProvider:
    name = "local"

def test_pipeline_fast_response():
    result = BrainPipeline(BrainRouter([FakeProvider()]), ConversationRouter()).prepare("hello")
    assert result.fast_path
    assert result.response

def test_pipeline_marks_action():
    result = BrainPipeline(BrainRouter([FakeProvider()]), ConversationRouter()).prepare("Chrome ta open koro")
    assert result.action_candidate
