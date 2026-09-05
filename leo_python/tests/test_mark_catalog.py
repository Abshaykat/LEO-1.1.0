from leo_python.integrations.mark_catalog import catalog

def test_mark_capability_catalog():
    items = catalog()
    assert "voice.stt" in items
    assert "voice.tts" in items
    assert "computer.control" in items
    assert "browser.control" in items
    assert all(x["status"] == "adapter_pending" for x in items.values())
