from .registry import Capability
from .local_files import read_file,list_directory
from .powershell import run_powershell
def register_safe_builtins(registry):
    registry.register(Capability("pc.file.read","Read a text file.",read_file))
    registry.register(Capability("pc.directory.list","List directory entries.",list_directory))
    registry.register(Capability("pc.powershell.run","Run policy-validated PowerShell.",run_powershell))
