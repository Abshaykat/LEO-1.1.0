# Mark Integration Security Quarantine

This migration intentionally separates third-party Mark code from L.E.O.

## Hard boundary

Mark-derived code is **data/source material**, not trusted L.E.O. authority.

It must never:
- bypass authentication;
- bypass permission checks;
- bypass owner approval;
- modify approval state except through L.E.O. approval APIs;
- grant or escalate permissions;
- modify security policies;
- execute arbitrary downloaded code;
- auto-install plugins/dependencies;
- dynamically import unreviewed remote code;
- self-register privileged capabilities;
- write outside approved execution boundaries;
- become active merely because a Mark repository changed.

## Safe integration path

Mark source -> review -> adapter -> capability registry -> permission policy -> approval (when required) -> controlled execution -> verification -> audit

Every Mark-derived adapter is disabled by default until its tests and runtime/security review pass.

## Branch policy

The migration work remains isolated from main. No automatic merge or synchronization is allowed. The historical 477cefe checkpoint remains untouched.

## Runtime policy

A future PC runtime must execute only the checked-in, reviewed L.E.O. adapter code. It must not execute source directly from GitHub or from an untrusted Mark checkout.
