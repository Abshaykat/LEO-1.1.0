from __future__ import annotations
from dataclasses import dataclass
from .action import ActionCandidate, ActionExtractor
from ..conversation.router import ConversationResult, ConversationRouter

@dataclass(frozen=True)
class ActionPlanResult:
    conversation: ConversationResult
    action: ActionCandidate | None

class ActionPipeline:
    def __init__(self) -> None:
        self.conversation = ConversationRouter()
        self.extractor = ActionExtractor()

    def plan(self, text: str) -> ActionPlanResult:
        conversation = self.conversation.route(text)
        action = self.extractor.extract(conversation.text) if conversation.intent.action else None
        return ActionPlanResult(conversation, action)
