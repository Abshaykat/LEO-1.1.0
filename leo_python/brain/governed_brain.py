from __future__ import annotations
from dataclasses import dataclass
from .types import Plan
from .planner import StructuredPlanner
from ..conversation.router import ConversationRouter
from ..communication.adapter import CommunicationAdapter
from ..capabilities.registry import CapabilityRegistry

@dataclass(frozen=True)
class BrainPlan:
    plan: Plan
    system_prompt: str

class GovernedBrain:
    """Single Python entry point: understand and plan, but never execute."""
    def __init__(self, registry: CapabilityRegistry) -> None:
        self.conversation = ConversationRouter()
        self.communication = CommunicationAdapter()
        self.planner = StructuredPlanner(registry)

    def prepare(self, user_message: str, raw_plan: str, conversation_size: int = 0) -> BrainPlan:
        self.conversation.route(user_message)
        prompt = self.communication.build(user_message, conversation_size).system_prompt
        return BrainPlan(self.planner.parse(raw_plan), prompt)
