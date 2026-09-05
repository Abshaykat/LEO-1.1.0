from __future__ import annotations
import asyncio
from dataclasses import dataclass
from typing import Protocol

class ModelProvider(Protocol):
    name: str
    async def complete(self, prompt: str) -> str: ...

@dataclass(frozen=True)
class ModelResult:
    text: str
    provider: str
    fallback: bool = False

class ModelRouter:
    def __init__(self, providers: list[ModelProvider], timeout_ms: int = 1500) -> None:
        self.providers = tuple(providers)
        self.timeout_ms = timeout_ms

    async def complete(self, prompt: str) -> ModelResult:
        if not self.providers:
            raise RuntimeError("No model providers configured.")
        last_error: Exception | None = None
        for index, provider in enumerate(self.providers):
            try:
                text = await asyncio.wait_for(
                    provider.complete(prompt), self.timeout_ms / 1000
                )
                return ModelResult(text, provider.name, index > 0)
            except Exception as exc:
                last_error = exc
        raise RuntimeError("All model providers failed.") from last_error
