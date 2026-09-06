from dataclasses import dataclass
from .action import ActionCandidate,ActionExtractor
from ..conversation.router import ConversationResult,ConversationRouter
@dataclass(frozen=True)
class ActionPlanResult:
    conversation:ConversationResult; action:ActionCandidate|None
class ActionPipeline:
    def __init__(self): self.conversation=ConversationRouter(); self.extractor=ActionExtractor()
    def plan(self,text:str)->ActionPlanResult:
        c=self.conversation.route(text); return ActionPlanResult(c,self.extractor.extract(c.text) if c.intent.action else None)
