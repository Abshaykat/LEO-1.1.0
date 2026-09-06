import re
from .types import Intent
_ACTIONS=re.compile(r"\b(open|close|run|send|save|delete|search|start|stop)\b|খুল|বন্ধ|চাল|পাঠা|সেভ|ডিলিট|খুঁজ",re.I)
def infer_intent(text:str)->Intent:
    v=text.strip(); a=bool(_ACTIONS.search(v)); return Intent(v,a,.65 if a else .80)
