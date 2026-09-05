from leo_python.memory import MemoryItem, MemoryRetriever, MemoryStore

def test_memory_persists_and_retrieves(tmp_path):
    path = tmp_path / "memory.json"
    store = MemoryStore(path)
    store.save(MemoryItem("1", "Owner prefers Banglish replies", "preference"))
    loaded = MemoryStore(path)
    results = MemoryRetriever(loaded).search("Banglish replies")
    assert results and results[0].id == "1"
