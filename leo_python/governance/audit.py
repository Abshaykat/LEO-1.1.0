from dataclasses import dataclass
from time import time
@dataclass(frozen=True)
class AuditEvent:
    event:str; action_hash:str|None; timestamp:float; details:dict
class AuditSink:
    def __init__(self): self.events=[]
    def record(self,event,*,action_hash=None,**details):
        e=AuditEvent(event,action_hash,time(),details); self.events.append(e); return e
