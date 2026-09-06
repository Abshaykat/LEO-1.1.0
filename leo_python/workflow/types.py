from dataclasses import dataclass
@dataclass(frozen=True)
class WorkflowStep:
    id:str; capability:str; parameters:dict; requires_approval:bool=False
@dataclass(frozen=True)
class Workflow:
    id:str; name:str; steps:tuple[WorkflowStep,...]
