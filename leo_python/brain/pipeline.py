from __future__ import annotations
from dataclasses import dataclass
from .intent import infer_intent
from .router import BrainRouter
from ..conversation.router import ConversationRouter, ConversationContext

@dataclass(frozen=True)
class BrainResult:
    response: str | None
    context: ConversationContext
    intent_goal: str
    action_candidate: bool
    fast_path: bool

class BrainPipeline:
    def __init__(self, router: BrainRouter, conversation: ConversationRouter) -> None:
        self.router = router
        self.conversation = conversation

    def prepare(self, text: str) -> BrainResult:
        fast = self.router.fast(text)
        ctx = self.conversation.prepare(text)
        intent = infer_intent(text)
        return BrainResult(
            response=fast.response,
            context=ctx,
            intent_goal=intent.goal,
            action_candidate=intent.action or ctx.action_candidate,
            fast_path=fast.handled,
        )
