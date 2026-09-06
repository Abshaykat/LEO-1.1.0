from __future__ import annotations
import asyncio
from urllib.parse import urlparse
from urllib.request import Request, urlopen

def validate_url(url: str) -> None:
    p=urlparse(url)
    if p.scheme not in {"http","https"} or not p.netloc:
        raise ValueError("only http/https URLs are allowed")

async def fetch(url: str, timeout: int=15) -> str:
    validate_url(url)
    return await asyncio.to_thread(_fetch_sync,url,timeout)

def _fetch_sync(url: str, timeout: int) -> str:
    req=Request(url,headers={"User-Agent":"LEO/1.1.0"})
    with urlopen(req,timeout=timeout) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP status {response.status}")
        length=response.headers.get("Content-Length")
        if length and int(length)>5_000_000:
            raise ValueError("response exceeds safety size limit")
        return response.read(5_000_001).decode(response.headers.get_content_charset() or "utf-8","replace")
