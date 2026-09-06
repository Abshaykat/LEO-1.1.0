from dataclasses import dataclass
@dataclass(frozen=True)
class MCPTool:
    name:str; description:str; input_schema:dict
class MCPToolRegistry:
    def __init__(self): self._tools={}
    def register(self,tool):
        if not tool.name.strip() or tool.name in self._tools: raise ValueError("invalid or duplicate MCP tool")
        self._tools[tool.name]=tool
    def discover(self,prefix=""): return [t for t in self._tools.values() if t.name.startswith(prefix)]
    def get(self,name): return self._tools.get(name)
