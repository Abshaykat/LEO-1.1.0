import asyncio,tempfile
from pathlib import Path
from zipfile import ZipFile
from leo_python.browser import validate_url
from leo_python.office import extract_docx_text
from leo_python.rag import Chunk,LocalRAGIndex
from leo_python.mcp import MCPTool,MCPToolRegistry
def test_web_policy_and_rag():
    validate_url("https://example.com")
    try: validate_url("file:///secret")
    except ValueError: pass
    else: assert False
    i=LocalRAGIndex(); i.add(Chunk("1","LEO approval security audit",{})); i.add(Chunk("2","unrelated",{}))
    assert i.search("approval security")[0].id=="1"
def test_docx_extraction():
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/"a.docx"
        xml='<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>LEO DOCX</w:t></w:r></w:p></w:body></w:document>'
        with ZipFile(p,"w") as z: z.writestr("word/document.xml",xml)
        assert extract_docx_text(str(p))=="LEO DOCX"
def test_mcp_discovery_is_metadata_only():
    r=MCPToolRegistry(); r.register(MCPTool("web.read","read",{"type":"object"}))
    assert [x.name for x in r.discover("web.")] == ["web.read"]
