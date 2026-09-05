from leo_python.brain.cache import ResponseCache
from leo_python.brain.fast_router import FastRouter

def test_fast_router_handles_common_input_without_model():
    result=FastRouter().route("  Hello  ")
    assert result.fast_path and result.response

def test_fast_router_reuses_cached_response():
    router=FastRouter(ResponseCache())
    first=router.route("hello")
    second=router.route("hello")
    assert not first.cache_hit and second.cache_hit
