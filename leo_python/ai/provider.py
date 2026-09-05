from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol, Sequence

@dataclass(frozen=True)
class ChatMessage:
    role: str
    content: str

@dataclass(frozen=True)
class ModelResponse:
    content: str
    provider: str
    model: str

class AIProvider(Protocol):
    name: str
    async def chat(self, messages: Sequence[ChatMessage], *, model: str | None = None) -> ModelResponse: ...

class ProviderRegistry:
    def __init__(self) -> None:
        self._providers: dict[str, AIProvider] = {}

    def register(self, provider: AIProvider) -> None:
        if provider.name in self._providers:
            raise ValueError(f"Provider already registered: {provider.name}")
        self._providers[provider.name] = provider

    def get(self, name: str) -> AIProvider | None:
        return self._providers.get(name)

    def names(self) -> tuple[str, ...]:
        return tuple(self._providers)
