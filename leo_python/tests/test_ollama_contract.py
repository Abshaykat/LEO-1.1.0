from leo_python.ai.ollama import OllamaProvider

def test_ollama_provider_requires_model():
    import asyncio
    async def run():
        try:
            await OllamaProvider().chat([], model=None)
        except ValueError:
            return
        raise AssertionError("Missing Ollama model was accepted.")
    asyncio.run(run())
