import asyncio,subprocess
from pathlib import Path
from ..security.powershell_policy import validate_powershell
async def run_powershell(a):
    p=a.get("parameters",{}); command=p.get("command"); ok,reason=validate_powershell(command)
    if not ok: raise PermissionError(reason)
    root=Path(p.get("workspace","")).resolve()
    if not root.is_dir(): raise FileNotFoundError(str(root))
    r=await asyncio.to_thread(subprocess.run,["powershell.exe","-NoProfile","-NonInteractive","-Command",command],cwd=str(root),capture_output=True,text=True,timeout=30)
    if r.returncode: raise RuntimeError(f"PowerShell failed ({r.returncode}): {r.stderr.strip()}")
    return r.stdout
