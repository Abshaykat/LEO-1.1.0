from __future__ import annotations
import asyncio
from typing import Awaitable, TypeVar
T = TypeVar("T")

async def with_timeout(operation: Awaitable[T], timeout_ms: int) -> T:
    if timeout_ms <= 0:
        raise ValueError("timeout_ms must be positive")
    return await asyncio.wait_for(operation, timeout=timeout_ms / 1000)
