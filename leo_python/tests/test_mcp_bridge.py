import asyncio
from leo_python.mcp.registry import MCPTool, MCPToolRegistry
from leo_python.mcp.bridge import GovernedMCPBridge, MCPBinding

def test_mcp_bridge_requires_registered_tool_and_maps_capability():
    r=MCPToolRegistry()
    r.register(MCPTool("web.read","read",{"type":"object"}))
    b=GovernedMCPBridge(r)
    async def execute(p): return p["ok"]
    b.bind(MCPBinding("web.read","web.read",execute))
    assert b.capability_for("web.read")=="web.read"
    assert asyncio.run(b.execute("web.read",{"ok":"yes"}))=="yes"

def test_unbound_mcp_tool_is_rejected():
    b=GovernedMCPBridge(MCPToolRegistry())
    try:
        asyncio.run(b.execute("unknown",{}))
        assert False
    except PermissionError:
        pass
