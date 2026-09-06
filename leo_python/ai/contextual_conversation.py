from __future__ import annotations
from .conversation_engine import LocalConversationEngine, ConversationReply
from .provider import ChatMessage
from .router import ModelRoute, ModelRouter
from ..communication.adapter import CommunicationAdapter
from ..memory.local_memory import LocalMemory, MemoryItem

class ContextualConversationEngine(LocalConversationEngine):
    """Conversation engine with bounded local memory context."""
    def __init__(self, router: ModelRouter, memory: LocalMemory | None = None,
                 communication: CommunicationAdapter | None = None) -> None:
        super().__init__(router, communication)
        self.memory = memory or LocalMemory()

    async def reply(self, user_message: str, *, route: ModelRoute, conversation_size: int = 0) -> ConversationReply:
        memories = self.memory.search(user_message, limit=6)
        envelope = self.communication.build(user_message, conversation_size)
        context = "
".join(f"[{m.kind}] {m.text}" for m in memories)
        messages = [ChatMessage("system", envelope.system_prompt)]
        if context:
            messages.append(ChatMessage("system", "Relevant local memory:\n" + context))
        messages.append(ChatMessage("user", envelope.user_message))
        result = await self.router.chat(messages, route)
        reply = ConversationReply(self.communication.normalize(result.content), result.provider, result.model)
        self.memory.put(MemoryItem(f"conversation:{conversation_size}", user_message, "conversation"))
        return reply
