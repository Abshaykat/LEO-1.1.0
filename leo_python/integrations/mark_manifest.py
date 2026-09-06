from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class MarkCapabilitySpec:
    name: str
    source: str = "mark"
    requires_approval: bool = True
    requires_verification: bool = True
    requires_audit: bool = True

    def validate(self) -> None:
        if not self.name.strip():
            raise ValueError("Capability name is required.")
        if self.source != "mark":
            raise ValueError("Mark capability source must remain explicit.")
        if not (self.requires_approval and self.requires_verification and self.requires_audit):
            raise ValueError("Mark capabilities cannot weaken L.E.O. governance.")
