from collections import Counter
from dataclasses import dataclass
import math
@dataclass(frozen=True)
class Chunk:
    id:str; text:str; metadata:dict
class LocalRAGIndex:
    def __init__(self): self._chunks={}
    def add(self,chunk): self._chunks[chunk.id]=chunk
    def search(self,query,limit=8):
        terms=query.casefold().split()
        scored=[]
        for c in self._chunks.values():
            words=c.text.casefold().split(); counts=Counter(words)
            score=sum(counts[t] for t in terms)
            if score: scored.append((score/math.sqrt(max(1,len(words))),c))
        scored.sort(key=lambda x:x[0],reverse=True)
        return [c for _,c in scored[:limit]]
