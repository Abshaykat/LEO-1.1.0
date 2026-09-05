from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable
from .fast_path import FastPath, FastPathResult
from .latency import LatencyBudget
from ..ai.provider import AIProvider

@dataclass(frozen=True)
class ModelRoute:
    provider: AIProvider
    model: str
    reason: str

class BrainRouter:
    """Selects a provider/model without changing permissions or authority."""

    def __init__(self, providers: Iterable[AIProvider], *,
                 budget: LatencyBudget | None = None) -> None:
        self.providers = tuple(providers)
        self.budget = budget or LatencyBudget()
        self.fast_path = FastPath(self.budget)

    def fast(self, text: str) -> FastPathResult:
        return self.fast_path.try_handle(text)

    def route(self, *, preferred_provider: str | None = None,
              preferred_model: str | None = None) -> ModelRoute | None:
        for provider in self.providers:
            if preferred_provider and provider.name != preferred_provider:
                continue
            if preferred_model:
                return ModelRoute(provider, preferred_model, "explicit model selection")
            return ModelRoute(provider, "", "first available provider")
        return None
