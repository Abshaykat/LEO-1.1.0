from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import uuid4
from ..ai.provider import ChatMessage

@dataclass
class ConversationSession:
    id: str = field(default_factory=lambda: str(uuid4()))
    messages: list[ChatMessage] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def add(self, role: str, content: str) -> None:
        self.messages.append(ChatMessage(role, content))

    def history(self, limit: int = 20) -> tuple[ChatMessage, ...]:
        return tuple(self.messages[-limit:])
