from __future__ import annotations
import asyncio, json
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class MCPResult:
    id: int
    result: dict[str, Any] | None
    error: dict[str, Any] | None

class StdioMCPClient:
    """Minimal dependency-free MCP JSON-RPC client over a child process stdio."""
    def __init__(self, command: list[str]) -> None:
        if not command: raise ValueError("command is required")
        self.command=command; self._proc=None; self._next_id=0

    async def connect(self) -> None:
        if self._proc is not None: return
        self._proc=await asyncio.create_subprocess_exec(*self.command,stdin=asyncio.subprocess.PIPE,stdout=asyncio.subprocess.PIPE)

    async def call(self, method: str, params: dict[str,Any] | None=None) -> MCPResult:
        await self.connect(); self._next_id+=1; rid=self._next_id
        payload={"jsonrpc":"2.0","id":rid,"method":method,"params":params or {}}
        assert self._proc and self._proc.stdin and self._proc.stdout
        self._proc.stdin.write((json.dumps(payload,separators=(",",":"))+"\n").encode()); await self._proc.stdin.drain()
        while True:
            line=await self._proc.stdout.readline()
            if not line: raise RuntimeError("MCP server closed stdout")
            msg=json.loads(line)
            if msg.get("id")==rid:
                return MCPResult(rid,msg.get("result"),msg.get("error"))

    async def close(self) -> None:
        if self._proc:
            self._proc.terminate()
            await self._proc.wait()
            self._proc=None
