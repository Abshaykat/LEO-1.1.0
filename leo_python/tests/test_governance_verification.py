from leo_python.governance.audit import AuditSink
from leo_python.governance.verification import Verifier

def test_audit_records_event():
    sink = AuditSink()
    e = sink.record("approval.consumed", action_hash="abc", capability="safe.echo")
    assert sink.events[-1] == e
    assert e.action_hash == "abc"

def test_verifier_requires_postcondition():
    v = Verifier()
    assert not v.verify("ok", None).verified
    assert v.verify("ok", lambda x: x == "ok").verified
    assert not v.verify("bad", lambda x: x == "ok").verified
