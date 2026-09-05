from __future__ import annotations
import re

BANGLA = re.compile(r"[\u0980-\u09FF]")
LATIN = re.compile(r"[A-Za-z]")

def detect_language(text: str) -> str:
    b = len(BANGLA.findall(text))
    l = len(LATIN.findall(text))
    if b and l:
        return "mixed"
    if b:
        return "bangla"
    return "english"

def preferred_reply_language(text: str) -> str:
    language = detect_language(text)
    if language == "bangla":
        return "bangla"
    if language == "mixed":
        return "banglish"
    return "english"
