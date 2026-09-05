from __future__ import annotations
import hashlib
import json
from typing import Any

def canonicalize(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)

def action_hash(tool_name: str, parameters: Any) -> str:
    payload = canonicalize({"tool_name": tool_name, "parameters": parameters})
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
