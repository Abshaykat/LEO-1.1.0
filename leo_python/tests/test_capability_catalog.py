from leo_python.capabilities.catalog import CapabilityCatalog, CapabilityDescriptor

def test_discovery_does_not_grant_authority():
    catalog=CapabilityCatalog()
    catalog.register(CapabilityDescriptor("system.open"))
    assert catalog.can_execute("system.open")
    assert catalog.discover("missing") is None
    assert catalog.discover("system.open").requires_owner_approval

def test_duplicate_capability_is_rejected():
    catalog=CapabilityCatalog()
    catalog.register(CapabilityDescriptor("system.open"))
    try:
        catalog.register(CapabilityDescriptor("system.open"))
        assert False
    except ValueError:
        assert True
