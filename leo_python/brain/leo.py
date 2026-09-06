from __future__ import annotations
from dataclasses import dataclass
from .governed_brain import GovernedBrain
from .governed_planner import GovernedActionPlanner
from .response import ResponseBuilder, ResponseEnvelope
from ..capabilities.registry import CapabilityRegistry

@dataclass(frozen=True)
class LeoRequest:
    message: str
    conversation_size: int = 0

class Leo:
    """Pure-Python conversational front door. It plans only; runtime owns execution."""
    def __init__(self, registry: CapabilityRegistry) -> None:
        self.brain = GovernedBrain(registry)
        self.action_planner = GovernedActionPlanner()
        self.responses = ResponseBuilder()

    def prepare(self, request: LeoRequest, raw_plan: str):
        return self.brain.prepare(request.message, raw_plan, request.conversation_size)

    def conversational_response(self, text: str, source: str = "python-brain") -> ResponseEnvelope:
        normalized = self.brain.communication.normalize(text)
        return self.responses.build(normalized, source)
