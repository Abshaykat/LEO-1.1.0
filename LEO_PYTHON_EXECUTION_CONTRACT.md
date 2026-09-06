# L.E.O. Python execution contract

The Python migration keeps the governance chain intact:

User input
-> conversation understanding
-> intent/action planning
-> capability discovery
-> permission evaluation
-> owner approval when required
-> controlled execution
-> post-condition verification
-> audit

Rules:
- Planning MUST NOT execute.
- Imported Mark capabilities MUST NOT receive authority from their source implementation.
- Mark adapters MUST remain subject to L.E.O. permission and approval.
- Verification failures MUST be reported and may trigger controlled recovery only.
- No component may grant itself permissions or bypass audit.
- Fast paths may answer or classify, but consequential actions still use governance.
- The latency target is fastest practical response with 3 seconds as the absolute ceiling for normal response handling.

This contract is intentionally implementation-neutral so tested Mark components can be reused without duplicating them.
