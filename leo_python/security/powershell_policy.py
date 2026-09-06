from __future__ import annotations
import re

_BLOCKED = (
    r"\b(remove-item|del|erase|format-volume|stop-computer|restart-computer|shutdown)\b",
    r"\b(invoke-webrequest|iwr|curl|wget|start-bitstransfer)\b",
    r"\b(invoke-expression|iex)\b",
)
_ALLOWED_PREFIXES = ("Get-", "Test-", "Write-Output", "Set-Location", "Get-ChildItem", "Get-Content")

def validate_powershell(command: str) -> tuple[bool, str]:
    if not isinstance(command, str) or not command.strip():
        return False, "command is required"
    normalized = command.strip()
    lowered = normalized.lower()
    for pattern in _BLOCKED:
        if re.search(pattern, lowered):
            return False, "blocked PowerShell operation"
    if len(normalized) > 2000:
        return False, "command exceeds safety length limit"
    return True, "ok"
