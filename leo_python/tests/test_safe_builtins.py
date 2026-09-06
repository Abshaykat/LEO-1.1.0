import asyncio, tempfile
from leo_python.capabilities import CapabilityRegistry
from leo_python.capabilities.builtin import register_safe_builtins

def test_safe_builtins_register_expected_capabilities():
    r=CapabilityRegistry(); register_safe_builtins(r)
    assert r.get("pc.file.read") is not None
    assert r.get("pc.directory.list") is not None
    assert r.get("pc.powershell.run") is not None

def test_unknown_capability_is_not_registered():
    r=CapabilityRegistry(); register_safe_builtins(r)
    assert r.get("pc.file.delete") is None
    assert r.get("pc.network.download") is None
