from __future__ import annotations
from collections.abc import Sequence
from ..ai.provider import AIProvider, ChatMessage, ModelResponse
from .response import communication_prompt, clean_response

class CommunicationBrain:
    def __init__(self, provider: AIProvider, model: str) -> None:
        self.provider = provider
        self.model = model

    async def respond(self, user_message: str, context: str = "",
                      history: Sequence[ChatMessage] = ()) -> ModelResponse:
        system = communication_prompt(user_message, context)
        messages = [ChatMessage("system", system), *history, ChatMessage("user", user_message)]
        result = await self.provider.chat(messages, model=self.model)
        return ModelResponse(clean_response(result.content), result.provider, result.model)
