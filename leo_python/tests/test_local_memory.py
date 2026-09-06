from leo_python.memory.local_memory import LocalMemory, MemoryItem

def test_local_memory_retrieval_and_owner_limit():
    m=LocalMemory(max_items=2)
    m.put(MemoryItem("1","Shaykat prefers Banglish","preference"))
    m.put(MemoryItem("2","LEO is pure Python","project"))
    m.put(MemoryItem("3","security approval required","security"))
    assert [x.key for x in m.search("security approval")] == ["3"]
    assert len(m._items)==2
