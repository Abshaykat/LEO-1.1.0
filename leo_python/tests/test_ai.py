import asyncio
from leo_python.ai.provider import ChatMessage, ModelResponse
from leo_python.communication.brain import CommunicationBrain

class FakeProvider:
    name = "fake"
    async def chat(self, messages, *, model=None):
        assert model == "test-model"
        assert messages[0].role == "system"
        assert "Banglish" in messages[0].content
        return ModelResponse("  Hello!  ", self.name, model)

def test_communication_brain():
    async def run():
        brain = CommunicationBrain(FakeProvider(), "test-model")
        result = await brain.respond("Leo, Chrome ta open koro")
        assert result.content == "Hello!"
        assert result.provider == "fake"
    asyncio.run(run())
