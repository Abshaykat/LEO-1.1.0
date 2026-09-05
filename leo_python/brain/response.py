from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class ResponseEnvelope:
    text: str
    source: str
    latency_ms: int | None = None
    complete: bool = True

class ResponseBuilder:
    def build(self, text: str, source: str, latency_ms: int | None = None) -> ResponseEnvelope:
        return ResponseEnvelope(text=text, source=source, latency_ms=latency_ms)
