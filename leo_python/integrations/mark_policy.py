from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class MarkIntegrationPolicy:
    require_approval: bool = True
    enabled: bool = False
    allow_network: bool = False
    allow_privilege_change: bool = False
    allow_dynamic_code: bool = False

    def validate(self) -> None:
        if not self.enabled and (self.allow_network or self.allow_privilege_change or self.allow_dynamic_code):
            raise ValueError("Disabled Mark integration cannot grant elevated capabilities.")
