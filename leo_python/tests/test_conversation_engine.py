import asyncio
from leo_python.ai.provider import ProviderRegistry, ChatMessage, ModelResponse
from leo_python.ai.router import ModelRouter, ModelRoute
from leo_python.ai.conversation_engine import LocalConversationEngine

class StubProvider:
    name="stub"
    async def chat(self,messages,*,model=None):
        assert messages[0].role=="system"
        assert "L.E.O." in messages[0].content
        return ModelResponse("  হ্যালো  ","stub",model or "test")

def test_local_conversation_engine():
    providers=ProviderRegistry(); providers.register(StubProvider())
    result=asyncio.run(LocalConversationEngine(ModelRouter(providers)).reply(
        "Hello", route=ModelRoute("stub","test"), conversation_size=1))
    assert result.text=="হ্যালো"
    assert result.provider=="stub"
