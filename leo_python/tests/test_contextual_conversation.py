import asyncio
from leo_python.ai.provider import ProviderRegistry, ModelResponse
from leo_python.ai.router import ModelRouter, ModelRoute
from leo_python.ai.contextual_conversation import ContextualConversationEngine
from leo_python.memory.local_memory import LocalMemory, MemoryItem

class Stub:
    async def chat(self,messages,*,model=None):
        assert any("LEO is local-first" in m.content for m in messages)
        return ModelResponse("ok","stub",model or "test")

def test_contextual_engine_uses_local_memory():
    registry=ProviderRegistry(); registry.register(type("P",(),{"chat":Stub().chat})())
    memory=LocalMemory(); memory.put(MemoryItem("p","LEO is local-first","project"))
    engine=ContextualConversationEngine(ModelRouter(registry),memory)
    result=asyncio.run(engine.reply("LEO local-first",route=ModelRoute("stub","test")))
    assert result.text=="ok"
