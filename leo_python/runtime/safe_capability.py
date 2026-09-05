from __future__ import annotations
from typing import Any
from ..capabilities import Capability, CapabilityRegistry

def register_safe_echo(registry: CapabilityRegistry) -> None:
    async def execute(action: dict[str, Any]) -> str:
        return str(action["parameters"].get("text", ""))
    registry.register(Capability("safe.echo", "safe local response utility", execute))
