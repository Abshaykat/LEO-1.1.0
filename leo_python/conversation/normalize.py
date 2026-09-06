import re
def normalize(text: str)->str:
    return re.sub(r"\s+"," ",text.replace("\u200c","").replace("\u200d","").strip())
def language_hint(text: str)->str:
    b=sum("\u0980"<=c<="\u09ff" for c in text); l=sum(c.lower()>="a" and c.lower()<="z" for c in text)
    return "banglish" if b and l else "bn" if b else "en" if l else "unknown"
