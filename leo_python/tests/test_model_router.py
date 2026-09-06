import asyncio
from leo_python.ai.provider import ProviderRegistry, ChatMessage, ModelResponse
from leo_python.ai.router import ModelRouter, ModelRoute

class StubProvider:
    name="stub"
    async def chat(self,messages,*,model=None):
        return ModelResponse("  hello  ","stub",model or "test")

def test_router_requires_registered_provider():
    registry=ProviderRegistry()
    router=ModelRouter(registry)
    try:
        asyncio.run(router.chat([ChatMessage("user","hi")],ModelRoute("missing","x")))
        assert False
    except RuntimeError:
        assert True

def test_router_bounds_output():
    registry=ProviderRegistry()
    registry.register(StubProvider())
    result=asyncio.run(ModelRouter(registry).chat([ChatMessage("user","hi")],ModelRoute("stub","test",3)))
    assert result.content=="hel"
