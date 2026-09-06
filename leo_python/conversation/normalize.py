from __future__ import annotations
import re

def normalize(text: str) -> str:
    text = text.replace("\u200c", "").replace("\u200d", "")
    return re.sub(r"\s+", " ", text.strip())

def language_hint(text: str) -> str:
    if not text: return "unknown"
    bangla = sum("\u0980" <= c <= "\u09ff" for c in text)
    latin = sum(("a" <= c.lower() <= "z") for c in text)
    if bangla and latin: return "banglish"
    if bangla: return "bn"
    if latin: return "en"
    return "unknown"
