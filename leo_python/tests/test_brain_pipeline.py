import pytest
from leo_python.brain.pipeline import BrainPipeline
from leo_python.brain.model_router import ModelRouter
from leo_python.brain.context import ContextItem

class Provider:
    name="local"
    async def complete(self,prompt): return "model answer"

@pytest.mark.asyncio
async def test_pipeline_skips_model_for_fast_response():
    p=BrainPipeline(ModelRouter([Provider()]))
    result=await p.respond("hello")
    assert result.route.fast_path
    assert result.model is None
    assert result.conversation is not None

@pytest.mark.asyncio
async def test_pipeline_uses_model_for_unknown_input_and_keeps_language():
    p=BrainPipeline(ModelRouter([Provider()]))
    result=await p.respond("Chrome ta open koro", [ContextItem("memory", .9)])
    assert result.model.text=="model answer"
    assert result.context[0].text=="memory"
    assert result.conversation.language=="banglish"
    assert result.conversation.intent.action
