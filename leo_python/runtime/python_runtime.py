from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from .response import ResponseEnvelope, ResponseBuilder
from .governed_planner import GovernedActionPlanner

class RequestKind(str, Enum):
    CHAT = "chat"
    ACTION = "action"

@dataclass(frozen=True)
class RuntimeDecision:
    kind: RequestKind
    prepared: object | None = None
    reason: str = ""

class PythonRuntime:
    """Pure-Python request router. It never executes actions itself."""
    def __init__(self, planner: GovernedActionPlanner | None = None) -> None:
        self.planner = planner or GovernedActionPlanner()
        self.responses = ResponseBuilder()

    def classify(self, text: str) -> RuntimeDecision:
        prepared = self.planner.prepare(text)
        if prepared.ready:
            return RuntimeDecision(RequestKind.ACTION, prepared)
        return RuntimeDecision(RequestKind.CHAT, None, prepared.reason)

    def status_response(self, text: str, source: str = "python-runtime") -> ResponseEnvelope:
        return self.responses.build(text.strip(), source)
