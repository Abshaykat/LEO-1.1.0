from __future__ import annotations
from typing import Any
from .bridge import GovernedMCPBridge
from ..runtime.capability_runner import CapabilityRunner, CapabilityRunRequest

class GovernedMCPExecutor:
    """MCP calls enter the normal capability runner; no alternate execution path."""
    def __init__(self, bridge: GovernedMCPBridge, runner: CapabilityRunner):
        self.bridge=bridge; self.runner=runner

    async def run(self, tool_name: str, parameters: dict[str, Any], approval_id: str|None=None,
                  requires_approval: bool=False, postcondition=None):
        capability=self.bridge.capability_for(tool_name)
        if capability is None:
            raise PermissionError("MCP tool is not governed")
        binding=self.bridge._bindings.get(tool_name)
        if binding is None:
            raise PermissionError("MCP tool is not bound")
        registered=self.runner.registry.get(capability)
        if registered is None:
            raise PermissionError("mapped capability unavailable")
        # The runner executes the registered capability. A binding may only describe
        # the MCP adapter; it never becomes a privileged execution shortcut.
        return await self.runner.run(CapabilityRunRequest(
            capability, parameters, approval_id, requires_approval, postcondition
        ))
