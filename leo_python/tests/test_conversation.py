from leo_python.conversation import ConversationRouter, ConversationSession
from leo_python.memory import MemoryItem, MemoryStore, MemoryRetriever

def test_session_keeps_multiturn_history():
    s = ConversationSession()
    s.add("user", "Hello")
    s.add("assistant", "Hi")
    assert [m.content for m in s.history()] == ["Hello", "Hi"]

def test_router_uses_language_and_memory(tmp_path):
    store = MemoryStore(tmp_path / "m.json")
    store.save(MemoryItem("1", "Owner prefers Banglish replies", "preference"))
    router = ConversationRouter(MemoryRetriever(store))
    ctx = router.prepare("Chrome ta open koro")
    assert ctx.language == "mixed"
    assert ctx.action_candidate
    assert ctx.memories
