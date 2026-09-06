from __future__ import annotations
import math
from dataclasses import dataclass
from collections import Counter

@dataclass(frozen=True)
class Chunk:
    id: str
    text: str
    metadata: dict[str,str]

class LocalRAGIndex:
    """Dependency-free TF-IDF-like retrieval; embedding backends can be added later."""
    def __init__(self) -> None:
        self._chunks: dict[str,Chunk]={}

    def add(self, chunk: Chunk) -> None: self._chunks[chunk.id]=chunk
    def search(self, query: str, limit: int=8) -> list[Chunk]:
        terms=[t.lower() for t in query.split() if t]
        if not terms: return []
        scored=[]
        for c in self._chunks.values():
            words=c.text.lower().split()
            counts=Counter(words)
            score=sum(counts[t] for t in terms)
            if score: scored.append((score/math.sqrt(max(1,len(words))),c))
        scored.sort(key=lambda x:x[0],reverse=True)
        return [c for _,c in scored[:limit]]
