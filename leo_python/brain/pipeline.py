from __future__ import annotations
from dataclasses import dataclass
from .fast_router import FastRouter, RouteResult
from .context import ContextItem, ContextSelector
from .model_router import ModelRouter, ModelResult
from ..conversation.router import ConversationRouter, ConversationResult

@dataclass(frozen=True)
class PipelineResult:
    route: RouteResult
    model: ModelResult | None = None
    context: tuple[ContextItem, ...] = ()
    conversation: ConversationResult | None = None

class BrainPipeline:
    def __init__(self, model_router: ModelRouter | None = None, context_selector: ContextSelector | None = None) -> None:
        self.fast = FastRouter()
        self.models = model_router
        self.context = context_selector or ContextSelector()
        self.conversation = ConversationRouter()

    async def respond(self, text: str, context: list[ContextItem] | None = None) -> PipelineResult:
        conv = self.conversation.route(text)
        route = self.fast.route(conv.text)
        selected = self.context.select(context or [])
        if route.response is not None:
            return PipelineResult(route, None, selected, conv)
        if self.models is None:
            return PipelineResult(route, None, selected, conv)
        model = await self.models.complete(conv.text)
        return PipelineResult(route, model, selected, conv)
