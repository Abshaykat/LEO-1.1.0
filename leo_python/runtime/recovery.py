from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

@dataclass(frozen=True)
class RecoveryResult:
    recovered: bool
    value: Any = None
    reason: str = ""

class RecoveryPolicy:
    def __init__(self, max_retries: int = 1) -> None:
        if max_retries < 0:
            raise ValueError("max_retries cannot be negative")
        self.max_retries = max_retries

    async def run(
        self,
        operation: Callable[[], Awaitable[Any]],
        *,
        verify: Callable[[Any], bool] | None = None,
    ) -> RecoveryResult:
        last_error = ""
        for attempt in range(self.max_retries + 1):
            try:
                value = await operation()
                if verify is None or verify(value):
                    return RecoveryResult(True, value, f"success on attempt {attempt + 1}")
                last_error = "post-condition failed"
            except Exception as exc:
                last_error = str(exc)
        return RecoveryResult(False, reason=last_error or "recovery attempts exhausted")
