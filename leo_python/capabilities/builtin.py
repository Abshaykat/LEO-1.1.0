from ..capabilities import CapabilityRegistry, Capability
from ..capabilities.local_files import read_file, list_directory
from .powershell import run_powershell
from ..browser.http import fetch
from ..office.text_extract import extract_docx_text

def register_read_only_files(registry: CapabilityRegistry) -> None:
    registry.register(Capability(name="pc.file.read",description="Read a text file.",executor=read_file))
    registry.register(Capability(name="pc.directory.list",description="List directory entries.",executor=list_directory))

def register_controlled_powershell(registry: CapabilityRegistry) -> None:
    registry.register(Capability(name="pc.powershell.run",description="Run policy-validated PowerShell in an explicit workspace.",executor=run_powershell))

def register_web_read(registry: CapabilityRegistry) -> None:
    async def web_read(action):
        return await fetch(action["parameters"]["url"])
    registry.register(Capability(name="web.read",description="Fetch an HTTP/HTTPS resource for read-only research.",executor=web_read))

def register_office_read(registry: CapabilityRegistry) -> None:
    async def docx_read(action):
        import asyncio
        return await asyncio.to_thread(extract_docx_text, action["parameters"]["path"])
    registry.register(Capability(name="office.docx.read",description="Extract text from a DOCX without modifying it.",executor=docx_read))

def register_safe_builtins(registry: CapabilityRegistry) -> None:
    register_read_only_files(registry)
    register_controlled_powershell(registry)
    register_web_read(registry)
    register_office_read(registry)
