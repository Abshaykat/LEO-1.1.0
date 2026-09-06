from dataclasses import dataclass
from typing import Any
@dataclass(frozen=True)
class ActionCandidate:
    name:str; arguments:dict[str,Any]; confidence:float; requires_approval:bool=True
class ActionExtractor:
    _verbs={"open":"system.open","close":"system.close","run":"system.run","search":"browser.search","check":"system.check","খুলো":"system.open","চালাও":"system.run","বন্ধ":"system.close","সার্চ":"browser.search"}
    def extract(self,text:str):
        v=text.casefold()
        for word,name in self._verbs.items():
            if word in v: return ActionCandidate(name,{"raw_text":text},.75)
        return None
