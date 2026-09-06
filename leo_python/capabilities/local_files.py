import asyncio
from pathlib import Path
def _path(a):
    raw=a.get("parameters",{}).get("path")
    if not isinstance(raw,str) or not raw: raise ValueError("A file path is required")
    return Path(raw).resolve()
async def read_file(a):
    p=_path(a)
    if not p.is_file(): raise FileNotFoundError(str(p))
    return await asyncio.to_thread(p.read_text,encoding="utf-8")
async def list_directory(a):
    p=_path(a)
    if not p.is_dir(): raise NotADirectoryError(str(p))
    return await asyncio.to_thread(lambda:sorted(x.name for x in p.iterdir()))
