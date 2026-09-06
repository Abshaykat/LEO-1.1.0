from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class MarkGuard:
    """Compatibility guard: imported Mark functionality must stay inside L.E.O. governance."""
    approval_required: bool = True
    verification_required: bool = True
    audit_required: bool = True

    def authorize(self, approved: bool) -> None:
        if self.approval_required and not approved:
            raise PermissionError("Owner approval required before Mark capability execution.")

    def verify(self, verified: bool) -> None:
        if self.verification_required and not verified:
            raise RuntimeError("Verification required before accepting Mark capability result.")

    def audit(self, audited: bool) -> None:
        if self.audit_required and not audited:
            raise RuntimeError("Audit record required for Mark capability execution.")
