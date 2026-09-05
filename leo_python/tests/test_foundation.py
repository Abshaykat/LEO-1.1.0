from leo_python.agents import AgentFactory, AgentSpec
from leo_python.capabilities import Capability, CapabilityRegistry
from leo_python.security.audit import AuditLog
import asyncio

def test_agent_factory_starts_unapproved():
    f = AgentFactory()
    spec = f.register_proposal(AgentSpec("research", "Research assistant"))
    assert not spec.enabled and not spec.owner_approved
    approved = f.approve("research")
    assert approved.enabled and approved.owner_approved

def test_capability_discovery():
    async def execute(_): return "ok"
    r = CapabilityRegistry()
    r.register(Capability("browser.open", "Open browser", execute))
    assert r.get("browser.open") is not None
    assert len(r.discover("browser")) == 1

def test_audit_log_writes_jsonl(tmp_path):
    log = AuditLog(tmp_path / "audit.jsonl")
    item = log.record("test", "owner", "success", details={"x": 1})
    assert item.event == "test"
    assert '"outcome": "success"' in (tmp_path / "audit.jsonl").read_text(encoding="utf-8")

def test_async_capability_shape():
    async def execute(_): return "ok"
    assert asyncio.run(execute({})) == "ok"
