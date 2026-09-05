from __future__ import annotations
import json
from urllib import request
from .provider import AIProvider, ChatMessage, ModelResponse

class OllamaProvider:
    name = "ollama"

    def __init__(self, base_url: str = "http://127.0.0.1:11434") -> None:
        self.base_url = base_url.rstrip("/")

    async def chat(self, messages: list[ChatMessage] | tuple[ChatMessage, ...], *, model: str | None = None) -> ModelResponse:
        if not model:
            raise ValueError("An Ollama model is required.")
        payload = json.dumps({
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": False,
        }).encode("utf-8")
        req = request.Request(
            self.base_url + "/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        # urllib is used deliberately for a dependency-light local-first baseline.
        with request.urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode("utf-8"))
        content = data.get("message", {}).get("content")
        if not isinstance(content, str):
            raise RuntimeError("Ollama returned an invalid response.")
        return ModelResponse(content=content, provider=self.name, model=model)
