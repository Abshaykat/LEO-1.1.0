from leo_python.mcp.registry import MCPTool, MCPToolRegistry

def test_mcp_discovery_is_deterministic_and_non_executing():
    r=MCPToolRegistry()
    r.register(MCPTool("web.read","read web",{"type":"object"}))
    r.register(MCPTool("office.read","read office",{"type":"object"}))
    assert [x.name for x in r.discover("web.")] == ["web.read"]
    assert r.get("web.read").description=="read web"
