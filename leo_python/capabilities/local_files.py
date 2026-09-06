from __future__ import annotations
import asyncio
from pathlib import Path
from typing import Any

def _path_from(action: dict[str, Any]) -> Path:
    raw = action.get("parameters", {}).get("path")
    if not isinstance(raw, str) or not raw:
        raise ValueError("A file path is required")
    path = Path(raw).resolve()
    return path

async def read_file(action: dict[str, Any]) -> str:
    path = _path_from(action)
    if not path.is_file():
        raise FileNotFoundError(str(path))
    return await asyncio.to_thread(path.read_text, encoding="utf-8")

async def list_directory(action: dict[str, Any]) -> list[str]:
    path = _path_from(action)
    if not path.is_dir():
        raise NotADirectoryError(str(path))
    return await asyncio.to_thread(lambda: sorted(p.name for p in path.iterdir()))
