# L.E.O. Brain Architecture

L.E.O. should not depend on one model. The brain is a controlled orchestration layer.

## Brain layers

1. Conversation understanding: multilingual context, references, intent and goal extraction.
2. Memory: short-term session state plus owner-controlled long-term memory and retrieval.
3. Planning: structured plans with explicit capability requirements and expected outcomes.
4. Model routing: local-first provider selection by task, with explicit policy and fallback.
5. Tool/capability reasoning: discover only registered capabilities.
6. Governance: permission, approval, execution boundaries and audit are outside the model and cannot be overridden by it.
7. Verification: post-condition checks before reporting success.
8. Recovery: diagnose failures and propose controlled recovery.
9. Evaluation: deterministic tests plus scenario-based evals for language understanding, planning, tool selection, refusal, grounding and security.
10. Response generation: natural Bangla/Banglish/English responses based on verified state.

## Model strategy

Use a provider abstraction so L.E.O. can use:
- local Ollama models for privacy and offline operation;
- stronger local models when hardware permits;
- approved remote models only when explicitly configured and permitted.

The model is replaceable. Security policy is not.

## Candidate open-source research

Mark-LII, Mark-LI, Mark-L, OpenVoiceOS, OVOS Persona, OpenVoice-AI, VoiceOS and other vetted open-source assistant/conversation projects may contribute ideas or isolated adapters after license/dependency/security review.

## Non-negotiable

No model, conversation module, agent or third-party repository can grant itself authority. The brain proposes; L.E.O.'s governance layer decides.
