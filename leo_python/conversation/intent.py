from __future__ import annotations
from dataclasses import dataclass
import re

@dataclass(frozen=True)
class IntentResult:
    intent: str
    action: bool
    confidence: float

_ACTION = re.compile(r"\b(open|close|run|create|delete|move|copy|download|search|send|check|start|stop)\b", re.I)
_BN_ACTION = ("খুলো","খুলে দাও","চালাও","তৈরি কর","ডিলিট","মুছে","পাঠাও","চেক কর","বন্ধ কর")

def detect_intent(text: str) -> IntentResult:
    value=text.strip()
    if not value: return IntentResult("empty",False,1.0)
    if _ACTION.search(value) or any(x in value for x in _BN_ACTION):
        return IntentResult("action",True,.85)
    if value.endswith("?") or any(x in value.lower() for x in ("what","why","how","কী","কেন","কিভাবে")):
        return IntentResult("question",False,.8)
    return IntentResult("conversation",False,.65)
