from leo_python.capabilities import CapabilityRegistry
from leo_python.capabilities.builtin import register_read_only_files

def test_builtin_capabilities_are_read_only():
    r=CapabilityRegistry(); register_read_only_files(r)
    assert r.get("pc.file.read") is not None
    assert r.get("pc.directory.list") is not None
    assert r.get("pc.file.write") is None
    assert r.get("pc.file.delete") is None
