import json,time
from dataclasses import dataclass
from hashlib import sha256
@dataclass(frozen=True)
class Approval:
    approval_id:str; action_hash:str; approved_at:float; consumed:bool=False
class ApprovalStore:
    def __init__(self): self._items={}
    @staticmethod
    def action_hash(action): return sha256(json.dumps(action,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    def issue(self,approval_id,action):
        a=Approval(approval_id,self.action_hash(action),time.time()); self._items[approval_id]=a; return a
    def consume(self,approval_id,action):
        a=self._items.get(approval_id)
        if not a or a.consumed or a.action_hash!=self.action_hash(action): return False
        self._items[approval_id]=Approval(a.approval_id,a.action_hash,a.approved_at,True); return True
