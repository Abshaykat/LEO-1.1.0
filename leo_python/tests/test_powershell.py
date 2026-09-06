import asyncio, tempfile
from pathlib import Path
from leo_python.capabilities.powershell import list_workspace, run_powershell

def test_workspace_listing():
    with tempfile.TemporaryDirectory() as d:
        Path(d,"x.txt").write_text("x")
        assert asyncio.run(list_workspace({"parameters":{"workspace":d}}))==["x.txt"]

def test_powershell_runs_inside_explicit_workspace():
    with tempfile.TemporaryDirectory() as d:
        result=asyncio.run(run_powershell({"parameters":{"workspace":d,"command":"Write-Output 'LEO-OK'"}}))
        assert result.strip()=="LEO-OK"
