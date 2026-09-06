from __future__ import annotations
from dataclasses import dataclass
from .provider import AIProvider, ChatMessage, ModelResponse

@dataclass(frozen=True)
class ModelRoute:
    provider: str
    model: str
    max_output_chars: int = 1200

class ModelRouter:
    """Selects an explicitly registered local provider. Routing never grants tool authority."""
    def __init__(self, providers) -> None:
        self.providers = providers

    def select(self, route: ModelRoute) -> AIProvider:
        provider = self.providers.get(route.provider)
        if provider is None:
            raise RuntimeError(f"AI provider is not configured: {route.provider}")
        return provider

    async def chat(self, messages: list[ChatMessage], route: ModelRoute) -> ModelResponse:
        response = await self.select(route).chat(messages, model=route.model)
        content = response.content.strip()
        if len(content) > route.max_output_chars:
            content = content[:route.max_output_chars].rstrip()
        return ModelResponse(content=content, provider=response.provider, model=response.model)
