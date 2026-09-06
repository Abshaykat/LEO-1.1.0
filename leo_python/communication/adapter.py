from __future__ import annotations
from dataclasses import dataclass
from .mark_style import CommunicationContext, build_system_prompt, normalize_response

@dataclass(frozen=True)
class PromptEnvelope:
    system_prompt: str
    user_message: str

class CommunicationAdapter:
    """Applies Mark's tested conversational behavior without owning execution authority."""
    def build(self, user_message: str, conversation_size: int = 0) -> PromptEnvelope:
        return PromptEnvelope(
            build_system_prompt(CommunicationContext(user_message, conversation_size)),
            user_message,
        )

    def normalize(self, response: str) -> str:
        return normalize_response(response)
