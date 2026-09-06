# L.E.O. 1.1.0 — Pure Python runtime

L.E.O. is a governed local assistant runtime. Its active implementation is dependency-free Python in [`leo_python/`](leo_python/), with an explicit execution chain:

```
input → side-effect-free planning → capability discovery → permission check
      → owner approval → controlled handler → verification → audit
```

Planning **never** runs a handler. Every consequential capability must be registered, explicitly allowed, owner-approved for the exact capability/parameters, verified, and audited. A discovered capability is not permission to use it.

## Run

```bash
python -m pytest
python -m leo_python "Chrome ta open koro"
```

## Embed

```python
from leo_python.runtime.leo import LeoRuntime

async def open_app(parameters):
    return "opened"

leo = LeoRuntime({"system.open": open_app})
prepared = leo.prepare("open Chrome")
leo.approve("owner-approval-1", prepared)
result = await leo.execute(prepared, "owner-approval-1")
```

The legacy TypeScript sources are retained as migration reference only; `pyproject.toml` and `leo_python/` define the runnable Python distribution.
