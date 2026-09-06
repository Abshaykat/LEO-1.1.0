import re
_BLOCKED=(r"\b(remove-item|del|erase|format-volume|stop-computer|restart-computer|shutdown)\b",r"\b(invoke-webrequest|iwr|curl|wget|start-bitstransfer)\b",r"\b(invoke-expression|iex)\b")
def validate_powershell(command:str):
    if not isinstance(command,str) or not command.strip(): return False,"command is required"
    if len(command)>2000: return False,"command exceeds safety length limit"
    for p in _BLOCKED:
        if re.search(p,command,re.I): return False,"blocked PowerShell operation"
    return True,"ok"
