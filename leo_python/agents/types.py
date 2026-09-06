from dataclasses import dataclass,field
@dataclass(frozen=True)
class AgentSpec:
    name:str; purpose:str; capabilities:tuple[str,...]=(); memory_scope:str|None=None; enabled:bool=False; owner_approved:bool=False; metadata:dict=field(default_factory=dict)
