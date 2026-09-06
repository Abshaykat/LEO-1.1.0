import asyncio
from urllib.parse import urlparse
from urllib.request import Request,urlopen
def validate_url(url:str)->None:
    p=urlparse(url)
    if p.scheme not in {"http","https"} or not p.netloc: raise ValueError("only http/https URLs are allowed")
async def fetch(url:str,timeout:int=15)->str:
    validate_url(url)
    return await asyncio.to_thread(_fetch,url,timeout)
def _fetch(url,timeout):
    with urlopen(Request(url,headers={"User-Agent":"LEO/1.1.0"}),timeout=timeout) as r:
        if not 200<=r.status<300: raise RuntimeError(f"HTTP status {r.status}")
        length=r.headers.get("Content-Length")
        if length and int(length)>5_000_000: raise ValueError("response exceeds safety size limit")
        return r.read(5_000_001).decode(r.headers.get_content_charset() or "utf8","replace")
