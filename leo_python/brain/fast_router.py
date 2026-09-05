from __future__ import annotations
from dataclasses import dataclass
from .cache import ResponseCache
from .fast_path import FastPath, FastPathResult

@dataclass(frozen=True)
class RouteResult:
    response: str | None
    fast_path: bool
    cache_hit: bool

class FastRouter:
    """Fastest-first response routing. Expensive model work is never the first hop."""

    def __init__(self, cache: ResponseCache | None = None) -> None:
        self.fast_path = FastPath()
        self.cache = cache or ResponseCache()

    def route(self, text: str) -> RouteResult:
        key = " ".join(text.strip().casefold().split())
        cached = self.cache.get(key)
        if cached is not None:
            return RouteResult(cached, False, True)
        result: FastPathResult = self.fast_path.try_handle(text)
        if result.handled and result.response is not None:
            self.cache.put(key, result.response)
        return RouteResult(result.response, result.handled, False)
