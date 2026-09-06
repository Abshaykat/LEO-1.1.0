from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Awaitable, Callable
from .registry import MCPToolRegistry

@dataclass(frozen=True)
class MCPBinding:
    tool_name: str
    capability_name: str
    executor: Callable[[dict[str, Any]], Awaitable[Any]]

class GovernedMCPBridge:
    """Maps discovered MCP tools to named capabilities without bypassing governance."""
    def __init__(self, registry: MCPToolRegistry) -> None:
        self.registry=registry
        self._bindings: dict[str,MCPBinding]={}

    def bind(self, binding: MCPBinding) -> None:
        if self.registry.get(binding.tool_name) is None:
            raise ValueError("MCP tool must be registered before binding")
        if binding.tool_name in self._bindings:
            raise ValueError("duplicate MCP binding")
        self._bindings[binding.tool_name]=binding

    def capability_for(self, tool_name: str) -> str | None:
        b=self._bindings.get(tool_name)
        return b.capability_name if b else None

    async def execute(self, tool_name: str, parameters: dict[str,Any]) -> Any:
        # Caller must have already passed L.E.O.'s permission/approval gate.
        b=self._bindings.get(tool_name)
        if b is None: raise PermissionError("MCP tool is not governed")
        return await b.executor(parameters)
