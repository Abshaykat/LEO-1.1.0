import {
  DiagnosticEngine
} from "./diagnostic-engine.ts";

import {
  RepairPlanner
} from "./repair-planner.ts";

import type {
  DiagnosticCheck,
  DiagnosticProvider
} from "./diagnostic-types.ts";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `REPAIR PLANNER TEST FAILURE: ${message}`
    );
  }
}

class TestDiagnosticProvider
  implements DiagnosticProvider {

  constructor(
    private readonly checks: DiagnosticCheck[]
  ) {}

  async runChecks(): Promise<DiagnosticCheck[]> {
    return this.checks;
  }
}

async function main(): Promise<void> {

  console.log(
    "=== L.E.O. REPAIR PLANNER TEST ==="
  );

  const failedChecks: DiagnosticCheck[] = [
    {
      name:
        "TypeScript",

      status:
        "failed",

      message:
        "TypeScript compilation failed.",

      evidence:
        [
          "Compilation error detected."
        ]
    }
  ];

  const diagnosticEngine =
    new DiagnosticEngine(
      new TestDiagnosticProvider(
        failedChecks
      )
    );

  const report =
    await diagnosticEngine.diagnose();

  const planner =
    new RepairPlanner();

  const plan =
    planner.createPlan(report);

  assert(
    plan.status === "repair_available",
    "Failed diagnostic did not produce a repair plan."
  );

  assert(
    plan.steps.length === 1,
    "Repair step was not generated."
  );

  assert(
    plan.requiresApproval === true,
    "Repair must require owner approval."
  );

  assert(
    plan.steps[0].description.includes(
      "TypeScript compilation failed."
    ),
    "Repair step does not reference the diagnosed issue."
  );

  assert(
    plan.verification.length >= 3,
    "Repair verification plan is incomplete."
  );

  console.log(
    "PASS: Failed diagnostic produced a structured repair plan."
  );

  console.log(
    "PASS: Repair plan contains actionable investigation steps."
  );

  console.log(
    "PASS: Repair requires explicit owner approval."
  );

  console.log(
    "PASS: Verification requirements were generated."
  );

  const healthyChecks: DiagnosticCheck[] = [
    {
      name:
        "TypeScript",

      status:
        "healthy",

      message:
        "TypeScript compilation is healthy."
    }
  ];

  const healthyReport =
    await new DiagnosticEngine(
      new TestDiagnosticProvider(
        healthyChecks
      )
    ).diagnose();

  const healthyPlan =
    planner.createPlan(
      healthyReport
    );

  assert(
    healthyPlan.status === "no_repair_needed",
    "Healthy system incorrectly received a repair plan."
  );

  assert(
    healthyPlan.requiresApproval === false,
    "No-repair state should not require approval."
  );

  console.log(
    "PASS: Healthy system correctly produces no repair."
  );

  console.log(
    "\n=== L.E.O. REPAIR PLANNER TEST PASSED ==="
  );
}

main().catch(error => {

  console.error(
    "\n=== L.E.O. REPAIR PLANNER TEST FAILED ==="
  );

  console.error(error);

  process.exit(1);
});
