from __future__ import annotations
from ..capabilities import CapabilityRegistry, Capability
from ..capabilities.local_files import read_file, list_directory
from .powershell import run_powershell

def register_read_only_files(registry: CapabilityRegistry) -> None:
    registry.register(Capability(name="pc.file.read", description="Read a text file without modifying it.", executor=read_file))
    registry.register(Capability(name="pc.directory.list", description="List directory entries without modifying the filesystem.", executor=list_directory))

def register_controlled_powershell(registry: CapabilityRegistry) -> None:
    registry.register(Capability(
        name="pc.powershell.run",
        description="Run a policy-validated PowerShell command inside an explicit workspace.",
        executor=run_powershell,
    ))

def register_safe_builtins(registry: CapabilityRegistry) -> None:
    register_read_only_files(registry)
    register_controlled_powershell(registry)
