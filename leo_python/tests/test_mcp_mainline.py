import asyncio
from leo_python.mcp import MCPTool,MCPToolRegistry,MCPBinding,GovernedMCPBridge
def test_mcp_is_discovery_and_binding_only():
 r=MCPToolRegistry(); r.register(MCPTool("web.read","read",{"type":"object"}))
 b=GovernedMCPBridge(r)
 async def adapter(p): return "adapter"
 b.bind(MCPBinding("web.read","pc.file.read",adapter))
 assert r.discover("web.")[0].name=="web.read"
 assert b.capability_for("web.read")=="pc.file.read"
 assert asyncio.run(b.binding_for("web.read").executor({}))=="adapter"
