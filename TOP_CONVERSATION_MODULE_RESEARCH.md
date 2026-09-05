# Top Conversation Module Research

Goal: make L.E.O.'s communication layer substantially stronger without importing untrusted authority.

## Candidate open-source sources

1. OpenVoiceOS (OVOS): modular, privacy-focused Python voice-assistant ecosystem. Useful concepts: message bus, sessions, converse protocol, STT/TTS plugin architecture, skills, personas, localization, and validated message models. OVOS itself warns that its bus is private and has no authentication/authorization, so L.E.O. must NOT copy that trust model; all consequential actions stay behind L.E.O. governance.
2. OVOS Persona: multi-persona conversation routing. Candidate for persona/solver selection, not for authority.
3. OpenVoice-AI: modern real-time voice conversation patterns including WebRTC/WebSocket streaming, VAD, ASR, TTS, interruption/barge-in, denoising, latency tracking, and multi-agent handoff. Candidate architecture only; GPU/cloud assumptions must be adapted to L.E.O.'s local-first constraints.
4. VoiceOS: desktop voice/typed assistant patterns with local Ollama, OS automation, permissions, and audit concepts. Candidate for UX and integration ideas, subject to source/license review.
5. Mark-LII + Mark family: primary computer-assistant source already under quarantine and L.E.O. governance.

## Proposed L.E.O. Top Conversation Module

User input -> session/context -> language detection -> conversation memory -> intent/goal understanding -> response planner -> model routing -> response generation -> safety/governance check -> text/voice output

For action requests:

conversation -> structured intent -> capability discovery -> permission -> owner approval -> execution -> verification -> audit -> natural-language result

### Conversation features to implement

- Bangla, Banglish, English and mixed-language detection
- Context-preserving multi-turn conversation
- Session/thread state
- Short-term conversation memory
- Long-term owner/project memory retrieval
- Pronoun/reference resolution
- Clarification only when required
- Natural interruption/barge-in support
- Streaming response architecture
- Voice/text parity
- Persona/style selection without changing authority
- Confidence/uncertainty handling
- Response grounding: never claim unverified actions
- Conversation summarization and compaction
- Local-first provider routing
- Model fallback without silently changing security policy
- Conversation audit metadata without storing unnecessary sensitive audio
- Explicit privacy controls for audio/transcripts

### Security boundary

Conversation components are never permission authorities. They can propose structured intents; only L.E.O.'s permission/approval/execution layers can authorize actions.

## Integration status

Research/catalog only. No third-party repository is copied wholesale or executed directly. Each adopted component requires license review, dependency review, adapter isolation, targeted tests, and L.E.O. security regression tests.
