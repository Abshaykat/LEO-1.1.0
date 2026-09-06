from __future__ import annotations
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class MCPTool:
    name: str
    description: str
    input_schema: dict[str, Any]

class MCPToolRegistry:
    """Discoverable MCP tools are metadata only until routed through L.E.O. governance."""
    def __init__(self) -> None:
        self._tools: dict[str, MCPTool] = {}

    def register(self, tool: MCPTool) -> None:
        if not tool.name.strip(): raise ValueError("tool name is required")
        if tool.name in self._tools: raise ValueError(f"duplicate MCP tool: {tool.name}")
        self._tools[tool.name] = tool

    def discover(self, prefix: str = "") -> list[MCPTool]:
        return [t for t in self._tools.values() if t.name.startswith(prefix)]

    def get(self, name: str) -> MCPTool | None:
        return self._tools.get(name)
