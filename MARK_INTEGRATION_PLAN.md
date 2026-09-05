# Mark LII -> L.E.O. Integration

The Mark LII repository was inspected before integration. Relevant capability
areas include STT, TTS, computer control, browser control, screen processing,
web search, desktop/app control, file control, system monitoring, reminders,
and background monitoring.

Integration rule:
1. Inspect implementation and dependencies.
2. Confirm license compatibility and preserve attribution.
3. Wrap capability behind L.E.O. capability registry.
4. Route every consequential action through L.E.O. permission/approval.
5. Add preconditions and post-condition verification.
6. Add failure handling and audit events.
7. Add targeted regression tests.
8. Only then mark the adapter integrated.

No Mark capability is considered integrated merely because it exists in the
catalog.
