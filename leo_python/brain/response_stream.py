from __future__ import annotations
from collections.abc import AsyncIterator

async def stream_text(text: str, chunk_size: int = 48) -> AsyncIterator[str]:
    if chunk_size < 1:
        raise ValueError("chunk_size must be positive")
    for start in range(0, len(text), chunk_size):
        yield text[start:start + chunk_size]
