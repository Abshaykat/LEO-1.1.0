"""Curated Mark LII capability catalog.

This module records capability interfaces first. Source code is not copied
blindly: each implementation must be reviewed for license, dependencies,
security boundary, and L.E.O. policy compatibility before integration.
"""

MARK_CAPABILITIES = {
    "voice.stt": {"source": "Mark LII", "path": "core/stt.py", "status": "adapter_pending"},
    "voice.tts": {"source": "Mark LII", "path": "core/tts.py", "status": "adapter_pending"},
    "computer.control": {"source": "Mark LII", "path": "actions/computer_control.py", "status": "adapter_pending"},
    "browser.control": {"source": "Mark LII", "path": "actions/browser_control.py", "status": "adapter_pending"},
    "screen.process": {"source": "Mark LII", "path": "actions/screen_processor.py", "status": "adapter_pending"},
    "web.search": {"source": "Mark LII", "path": "actions/web_search.py", "status": "adapter_pending"},
}

def catalog() -> dict[str, dict[str, str]]:
    return dict(MARK_CAPABILITIES)
