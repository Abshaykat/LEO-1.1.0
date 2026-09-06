from __future__ import annotations
from ..capabilities import CapabilityRegistry, Capability
from ..capabilities.local_files import read_file, list_directory

def register_read_only_files(registry: CapabilityRegistry) -> None:
    """Register only non-mutating local filesystem capabilities."""
    registry.register(Capability(
        name="pc.file.read",
        description="Read a text file without modifying it.",
        executor=read_file,
    ))
    registry.register(Capability(
        name="pc.directory.list",
        description="List directory entries without modifying the filesystem.",
        executor=list_directory,
    ))
