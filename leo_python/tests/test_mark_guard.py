import pytest
from leo_python.integrations.mark_guard import MarkGuard
from leo_python.integrations.mark_manifest import MarkCapabilitySpec

def test_mark_guard_requires_owner_approval():
    with pytest.raises(PermissionError):
        MarkGuard().authorize(False)

def test_mark_guard_requires_verification_and_audit():
    guard=MarkGuard()
    with pytest.raises(RuntimeError): guard.verify(False)
    with pytest.raises(RuntimeError): guard.audit(False)

def test_mark_manifest_cannot_weaken_governance():
    with pytest.raises(ValueError):
        MarkCapabilitySpec("browser", requires_approval=False).validate()
