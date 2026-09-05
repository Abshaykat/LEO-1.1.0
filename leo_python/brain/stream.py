from __future__ import annotations
from collections.abc import AsyncIterator

async def single_response(text: str) -> AsyncIterator[str]:
    yield text
