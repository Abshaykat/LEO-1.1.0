from __future__ import annotations
from dataclasses import dataclass
from .fast_router import FastRouter, RouteResult
from .context import ContextItem, ContextSelector
from .model_router import ModelRouter, ModelResult

@dataclass(frozen=True)
class PipelineResult:
    route: RouteResult
    model: ModelResult | None = None
    context: tuple[ContextItem, ...] = ()

class BrainPipeline:
    def __init__(self, model_router: ModelRouter | None = None, context_selector: ContextSelector | None = None) -> None:
        self.fast = FastRouter()
        self.models = model_router
        self.context = context_selector or ContextSelector()

    async def respond(self, text: str, context: list[ContextItem] | None = None) -> PipelineResult:
        route = self.fast.route(text)
        selected = self.context.select(context or [])
        if route.response is not None:
            return PipelineResult(route, None, selected)
        if self.models is None:
            return PipelineResult(route, None, selected)
        model = await self.models.complete(text)
        return PipelineResult(route, model, selected)
