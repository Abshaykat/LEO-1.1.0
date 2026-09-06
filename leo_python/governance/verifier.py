from dataclasses import dataclass
@dataclass(frozen=True)
class Verification:
    verified:bool; reason:str
class Verifier:
    def verify(self,value,postcondition):
        if postcondition is None: return Verification(True,"Execution completed; no postcondition supplied.")
        try: ok=bool(postcondition(value))
        except Exception as exc: return Verification(False,f"Postcondition failed: {exc}")
        return Verification(ok,"Postcondition passed." if ok else "Postcondition returned false.")
