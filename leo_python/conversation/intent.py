from dataclasses import dataclass
import re
@dataclass(frozen=True)
class IntentResult:
    intent:str; action:bool; confidence:float
_ACTION=re.compile(r"\b(open|close|run|create|delete|move|copy|download|search|send|check|start|stop)\b",re.I)
_BN=("খুলো","খুলে দাও","চালাও","তৈরি কর","ডিলিট","মুছে","পাঠাও","চেক কর","বন্ধ কর")
def detect_intent(text:str)->IntentResult:
    if not text.strip(): return IntentResult("empty",False,1.0)
    if _ACTION.search(text) or any(x in text for x in _BN): return IntentResult("action",True,.85)
    if text.rstrip().endswith("?") or any(x in text.lower() for x in ("what","why","how","কী","কেন","কিভাবে")): return IntentResult("question",False,.8)
    return IntentResult("conversation",False,.65)
