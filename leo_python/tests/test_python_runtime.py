from leo_python.runtime.python_runtime import PythonRuntime, RequestKind

def test_runtime_routes_action():
    d=PythonRuntime().classify("Chrome ta open koro")
    assert d.kind is RequestKind.ACTION
    assert d.prepared is not None

def test_runtime_routes_chat():
    d=PythonRuntime().classify("What is LEO?")
    assert d.kind is RequestKind.CHAT
    assert d.prepared is None
