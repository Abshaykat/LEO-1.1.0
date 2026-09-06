import asyncio, threading
from leo_python.browser.http import _fetch_sync

class FakeResponse:
    status=200
    class H:
        def get_content_charset(self): return "utf-8"
        def get(self,k): return "5000001" if k=="Content-Length" else None
    headers=H()
    def read(self,n): return b"x"*n
    def __enter__(self): return self
    def __exit__(self,*a): pass

def test_web_read_rejects_oversized_declared_response(monkeypatch):
    monkeypatch.setattr("leo_python.browser.http.urlopen",lambda *a,**k:FakeResponse())
    try:
        _fetch_sync("https://example.com",1)
        assert False
    except ValueError:
        pass
