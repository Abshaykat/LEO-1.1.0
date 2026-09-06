from __future__ import annotations
from dataclasses import dataclass
from .provider import ChatMessage, ModelResponse
from .router import ModelRoute, ModelRouter
from ..communication.adapter import CommunicationAdapter

@dataclass(frozen=True)
class ConversationReply:
    text: str
    provider: str
    model: str

class LocalConversationEngine:
    """Pure-Python conversational path. It does not execute capabilities."""
    def __init__(self, router: ModelRouter, communication: CommunicationAdapter | None = None) -> None:
        self.router = router
        self.communication = communication or CommunicationAdapter()

    async def reply(self, user_message: str, *, route: ModelRoute, conversation_size: int = 0) -> ConversationReply:
        envelope = self.communication.build(user_message, conversation_size)
        result: ModelResponse = await self.router.chat([
            ChatMessage("system", envelope.system_prompt),
            ChatMessage("user", envelope.user_message),
        ], route)
        return ConversationReply(
            text=self.communication.normalize(result.content),
            provider=result.provider,
            model=result.model,
        )
