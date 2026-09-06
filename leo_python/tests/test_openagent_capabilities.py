from leo_python.rag.index import LocalRAGIndex, Chunk
from leo_python.browser.http import validate_url

def test_rag_retrieves_relevant_chunk():
    i=LocalRAGIndex()
    i.add(Chunk("a","LEO security approval audit","project"))
    i.add(Chunk("b","unrelated cooking notes","misc"))
    assert i.search("security approval")[0].id=="a"

def test_browser_url_policy():
    validate_url("https://example.com")
    try:
        validate_url("file:///C:/secret")
        assert False
    except ValueError:
        pass
