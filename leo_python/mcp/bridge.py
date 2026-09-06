from dataclasses import dataclass
from typing import Any,Awaitable,Callable
from .registry import MCPToolRegistry
@dataclass(frozen=True)
class MCPBinding:
    tool_name:str; capability_name:str; executor:Callable[[dict[str,Any]],Awaitable[Any]]
class GovernedMCPBridge:
    def __init__(self,registry:MCPToolRegistry): self.registry=registry; self._bindings={}
    def bind(self,binding:MCPBinding):
        if self.registry.get(binding.tool_name) is None: raise ValueError("MCP tool must be registered before binding")
        if self.registry.get(binding.tool_name).name != binding.tool_name or binding.tool_name in self._bindings: raise ValueError("invalid or duplicate MCP binding")
        self._bindings[binding.tool_name]=binding
    def capability_for(self,tool_name): 
        b=self._bindings.get(tool_name); return b.capability_name if b else None
    def binding_for(self,tool_name): return self._bindings.get(tool_name)
