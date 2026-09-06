"""Run coroutine tests without pytest-asyncio, keeping the test suite dependency-free."""
from __future__ import annotations
import asyncio
import inspect

def pytest_configure(config):
    config.addinivalue_line("markers", "asyncio: dependency-free async test")

def pytest_pyfunc_call(pyfuncitem):
    test = pyfuncitem.obj
    if inspect.iscoroutinefunction(test):
        asyncio.run(test(**pyfuncitem.funcargs))
        return True
    return None
