from __future__ import annotations
from dataclasses import dataclass
import re

Language = str

@dataclass(frozen=True)
class CommunicationContext:
    user_message: str
    conversation_size: int = 0

def detect_language(text: str) -> Language:
    value=text.strip()
    if not value: return "english"
    has_bn=bool(re.search(r"[\u0980-\u09FF]", value))
    latin=len(re.findall(r"[A-Za-z]", value))
    bangla=len(re.findall(r"[\u0980-\u09FF]", value))
    if has_bn and latin: return "mixed"
    if has_bn and bangla >= latin: return "bangla"
    return "english"

def build_system_prompt(ctx: CommunicationContext) -> str:
    lang=detect_language(ctx.user_message)
    return "You are L.E.O., the owner's private personal computer and technology assistant. "         "Communicate naturally, directly, calmly and helpfully. Understand English, Bangla, Banglish and mixed language. "         "Reply using the style of the owner's MOST RECENT message. Preserve meaning and context. "         "Never claim an action completed unless runtime confirms it. Consequential actions remain behind L.E.O. permission, owner approval, execution, verification and audit boundaries. "         "Do not invent capabilities. Keep simple replies short and useful. Current language hint: "+lang+"."

def normalize_response(text: str) -> str:
    return re.sub(r"\n{3,}", "\n\n", text.strip())
