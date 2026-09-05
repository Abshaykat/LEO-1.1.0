# Mark-family -> L.E.O. Integration

## Current primary source

**Mark-LII** is the primary current Mark source. Its GitHub `main` currently points to commit 234dd792737f3acd38ca836aadae94c24ef0ad56 (2026-09-02). The repository describes LII as the newest/current advanced Mark line and documents a foundation shared across LII and later Mark generations. LII includes voice, vision, computer control, browser control, plugins, memory, dashboard/UI, and cross-platform support.

## Other discovered FatihMakes repositories

| Repository | Role | Decision |
|---|---|---|
| Mark-LI | Earlier generation with plugin system, affective dialog, proactive audio, long sessions | Inspect as historical feature source; prefer LII where duplicated |
| Mark-L | Earlier generation focused on session memory/background monitoring | Inspect for feature behavior and fallback ideas |
| Mark-X.1 | Older Mark generation | Inspect only for useful capabilities not superseded by newer code |
| Mark-X-TR | Older Mark generation | Inspect only for unique reusable capabilities |
| Mark-XXXIX-OR | Older Mark generation with computer/browser/file/code/dev-agent capabilities | Inspect for unique tool behavior and recovery ideas |
| AI-Assistant-for-Computer | Older standalone computer-assistant project | Inspect for unique PC-control/UI ideas |

No repositories named Mark-LIII, Mark-LIV, or Mark-LV were found under FatihMakes through the GitHub repository endpoint checked on 2026-09-06. The current Mark-LII README does state that its foundation update also landed across LIII, LIV and LV; this is not treated as proof that separate public repositories exist.

## Integration policy

1. Mark-LII is the primary source; do not blindly merge older generations.
2. Inspect implementation and dependencies before adaptation.
3. Preserve applicable license/attribution requirements.
4. Wrap every capability behind the L.E.O. capability registry.
5. Route consequential actions through L.E.O. permission and owner approval.
6. Add preconditions, post-condition verification, recovery, and audit events.
7. Reject capability paths that can bypass L.E.O. security boundaries.
8. Add targeted regression tests before marking an adapter integrated.
9. Keep historical L.E.O. checkpoint 477cefe untouched as a recovery/reference point.

### Current Mark capability catalog

- voice.stt
- voice.tts
- computer.control
- browser.control
- screen.process
- web.search
- plugins
- session memory
- background monitoring
- proactive audio
- vision/camera
- desktop/application control
- file control
- code/dev assistance
- dashboard/UI

Only cataloged capabilities are candidates. Candidate does not mean integrated or production-ready.


## Security quarantine rule

Mark-derived code is treated as untrusted third-party source until reviewed. No Mark repository is vendored, copied wholesale, imported at runtime, or granted L.E.O. authority automatically. Mark-derived capabilities must enter through reviewed adapters and the L.E.O. capability registry. A capability is inactive by default and cannot execute until its permission policy, approval requirements, verification contract, audit behavior, dependency review, and targeted security tests pass.

Repository isolation rules:
- Mark source repositories remain external references; L.E.O. does not execute code directly from them.
- No automatic GitHub sync, remote code execution, plugin auto-install, dynamic import, or dependency auto-upgrade from Mark sources.
- No adapter may grant permissions, modify security policy, alter approval rules, or self-register executable authority.
- Network-facing and computer-control adapters are deny-by-default until explicitly enabled and tested.
- Integration commits stay on the migration branch until local runtime/security acceptance is performed on the owner's PC.
- Main branch remains unchanged during migration; no automatic merge is permitted.
