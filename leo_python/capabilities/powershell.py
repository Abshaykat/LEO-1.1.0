from __future__ import annotations
import asyncio
import subprocess
from pathlib import Path
from typing import Any

def _workspace(action: dict[str, Any]) -> Path:
    raw = action.get("parameters", {}).get("workspace")
    if not isinstance(raw, str) or not raw:
        raise ValueError("workspace is required")
    root = Path(raw).resolve()
    if not root.exists() or not root.is_dir():
        raise FileNotFoundError(str(root))
    return root

async def list_workspace(action: dict[str, Any]) -> list[str]:
    root = _workspace(action)
    return await asyncio.to_thread(lambda: sorted(p.name for p in root.iterdir()))

async def run_powershell(action: dict[str, Any]) -> str:
    command = action.get("parameters", {}).get("command")
    if not isinstance(command, str) or not command.strip():
        raise ValueError("command is required")
    workspace = _workspace(action)
    # Execution remains gated by the caller's approval/permission layer.
    completed = await asyncio.to_thread(
        subprocess.run,
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", command],
        cwd=str(workspace), capture_output=True, text=True, timeout=30,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"PowerShell failed ({completed.returncode}): {completed.stderr.strip()}")
    return completed.stdout
