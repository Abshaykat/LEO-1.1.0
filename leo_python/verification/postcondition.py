from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Callable

@dataclass(frozen=True)
class VerificationResult:
    verified: bool
    reason: str
    observed: Any = None

def verify(check: Callable[[], Any], *, description: str) -> VerificationResult:
    try:
        observed = check()
        passed = bool(observed)
        return VerificationResult(passed, description if passed else f"Post-condition failed: {description}", observed)
    except Exception as exc:
        return VerificationResult(False, f"Verification error: {exc}")

