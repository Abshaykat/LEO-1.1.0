from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Mapping

@dataclass(frozen=True)
class CapabilityDescriptor:
    name: str
    version: str = "1.0"
    source: str = "leo"
    consequential: bool = True
    requires_owner_approval: bool = True

class CapabilityCatalog:
    """Read-only capability discovery. Discovery never grants authority."""
    def __init__(self, capabilities: Mapping[str, CapabilityDescriptor] | None = None) -> None:
        self._capabilities = dict(capabilities or {})

    def register(self, capability: CapabilityDescriptor) -> None:
        if capability.name in self._capabilities:
            raise ValueError(f"Capability already registered: {capability.name}")
        if not capability.name.strip():
            raise ValueError("Capability name is required")
        self._capabilities[capability.name] = capability

    def discover(self, name: str) -> CapabilityDescriptor | None:
        return self._capabilities.get(name)

    def list(self) -> tuple[CapabilityDescriptor, ...]:
        return tuple(self._capabilities.values())

    def is_registered(self, name: str) -> bool:
        """Return availability metadata only; this is not an authorization decision."""
        return self.discover(name) is not None

    def can_execute(self, name: str) -> bool:
        """Compatibility alias for :meth:`is_registered`.

        Execution authority is exclusively decided by ``CapabilityRunner``.
        """
        return self.is_registered(name)
