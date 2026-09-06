"""Small local demo CLI. It never approves or executes actions automatically."""
from __future__ import annotations
import argparse
from .brain.governed_planner import GovernedActionPlanner

def main() -> int:
    parser = argparse.ArgumentParser(description="L.E.O. governed Python planner")
    parser.add_argument("request", help="Natural-language request to prepare")
    args = parser.parse_args()
    prepared = GovernedActionPlanner().prepare(args.request)
    print(prepared.reason)
    if prepared.plan.action:
        print(f"capability={prepared.plan.action.name} approval_required={prepared.plan.action.requires_approval}")
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
