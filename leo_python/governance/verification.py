from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Callable

@dataclass(frozen=True)
class VerificationResult:
    verified: bool
    reason: str

class Verifier:
    def verify(self, result: Any, check: Callable[[Any], bool] | None) -> VerificationResult:
        if check is None:
            return VerificationResult(False, "No post-condition supplied.")
        try:
            ok = bool(check(result))
        except Exception as exc:
            return VerificationResult(False, f"Verification failed: {exc}")
        return VerificationResult(ok, "Post-condition satisfied." if ok else "Post-condition not satisfied.")
