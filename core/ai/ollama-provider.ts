import type {
  AIProvider,
  AIRequest,
  AIResponse
} from "./ai-provider.ts";

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  model?: string;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaAIProviderOptions {
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OllamaAIProvider implements AIProvider {

  readonly name = "ollama";

  private readonly baseUrl: string;
  private readonly model: string;
  private readonly temperature?: number;
  private readonly maxTokens?: number;

  constructor(
    options: OllamaAIProviderOptions = {}
  ) {
    this.baseUrl =
      options.baseUrl ??
      "http://localhost:11434";

    this.model =
      options.model ??
      "qwen3:1.7b";

    this.temperature =
      options.temperature;

    this.maxTokens =
      options.maxTokens;
  }

  async generate(
    request: AIRequest
  ): Promise<AIResponse> {

    const response =
      await fetch(
        `${this.baseUrl}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            model: this.model,

            messages:
              request.messages,

            stream: false,

            options: {
              ...(this.temperature !== undefined
                ? {
                    temperature:
                      this.temperature
                  }
                : {}),

              ...(this.maxTokens !== undefined
                ? {
                    num_predict:
                      this.maxTokens
                  }
                : {})
            }
          })
        }
      );

    if (!response.ok) {
      throw new Error(
        `Ollama API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data =
      await response.json() as OllamaChatResponse;

    const content =
      data.message?.content;

    if (
      typeof content !== "string"
    ) {
      throw new Error(
        "Ollama API returned no assistant message content."
      );
    }

    return {
      content,
      model:
        data.model ??
        this.model,
      provider:
        this.name,
      usage: {
        inputTokens:
          data.prompt_eval_count,
        outputTokens:
          data.eval_count
      }
    };
  }
}
