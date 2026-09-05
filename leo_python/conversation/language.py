from __future__ import annotations
import re

_BN = re.compile(r"[\u0980-\u09FF]")
_EN = re.compile(r"[A-Za-z]")

def detect_language(text: str) -> str:
    bn = len(_BN.findall(text))
    en = len(_EN.findall(text))
    if bn and en:
        return "mixed"
    if bn:
        return "bn"
    return "en"
