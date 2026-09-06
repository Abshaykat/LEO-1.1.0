import asyncio, tempfile
from pathlib import Path
from leo_python.capabilities.local_files import read_file, list_directory

def test_read_file():
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/"a.txt"; p.write_text("hello",encoding="utf-8")
        assert asyncio.run(read_file({"parameters":{"path":str(p)}}))=="hello"

def test_list_directory():
    with tempfile.TemporaryDirectory() as d:
        Path(d,"b.txt").write_text("b")
        Path(d,"a.txt").write_text("a")
        assert asyncio.run(list_directory({"parameters":{"path":d}}))==["a.txt","b.txt"]
