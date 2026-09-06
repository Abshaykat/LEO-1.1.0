from dataclasses import dataclass
from typing import Any,Awaitable,Callable
Executor=Callable[[dict[str,Any]],Awaitable[Any]]
@dataclass(frozen=True)
class Capability:
    name:str; description:str; executor:Executor; enabled:bool=True
class CapabilityRegistry:
    def __init__(self): self._items={}
    def register(self,c):
        if c.name in self._items: raise ValueError(f"Capability already registered: {c.name}")
        self._items[c.name]=c
    def get(self,name):
        c=self._items.get(name); return c if c and c.enabled else None
    def discover(self,q=""):
        q=q.casefold().strip(); return [c for c in self._items.values() if not q or q in c.name.casefold() or q in c.description.casefold()]
