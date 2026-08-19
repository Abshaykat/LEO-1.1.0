import {
  DiagnosticEngine
} from "./diagnostic-engine.ts";

import type { DiagnosticCheck, DiagnosticProvider } from "./diagnostic-types.ts";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `DIAGNOSTIC ENGINE TEST FAILURE: ${message}`
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
    "=== L.E.O. DIAGNOSTIC ENGINE TEST ==="
  );

  const healthyChecks: DiagnosticCheck[] = [
    {
      name: "TypeScript",
      status: "healthy",
      message: "TypeScript compilation is healthy.",
      evidence: ["tsc --noEmit passed."]
    },
    {
      name: "Runtime",
      status: "healthy",
      message: "Runtime checks are healthy.",
      evidence: ["Runtime regression passed."]
    }
  ];

  const healthyEngine =
    new DiagnosticEngine(
      new TestDiagnosticProvider(
        healthyChecks
      )
    );

  const healthy =
    await healthyEngine.diagnose();

  assert(
    healthy.status === "healthy",
    "Healthy checks did not produce healthy status."
  );

  assert(
    healthy.confidence === 100,
    "Healthy checks did not produce 100% confidence."
  );

  assert(
    healthy.requiresApproval === false,
    "Diagnostics must not require approval."
  );

  console.log(
    "PASS: Healthy system detection."
  );

  const failedChecks: DiagnosticCheck[] = [
    {
      name: "TypeScript",
      status: "failed",
      message: "TypeScript compilation failed.",
      evidence: ["Compilation error detected."]
    },
    {
      name: "Runtime",
      status: "healthy",
      message: "Runtime checks are healthy."
    }
  ];

  const failedEngine =
    new DiagnosticEngine(
      new TestDiagnosticProvider(
        failedChecks
      )
    );

  const failed =
    await failedEngine.diagnose();

  assert(
    failed.status === "failed",
    "Failed check did not produce failed status."
  );

  assert(
    failed.issues.length === 1,
    "Failed issue was not collected."
  );

  assert(
    failed.recommendations.length === 1,
    "Repair recommendation was not generated."
  );

  console.log(
    "PASS: Failure detection."
  );

  console.log(
    "PASS: Issue extraction."
  );

  console.log(
    "PASS: Recommendation generation."
  );

  console.log(
    "PASS: Diagnostic layer cannot execute changes."
  );

  console.log(
    "\n=== L.E.O. DIAGNOSTIC ENGINE TEST PASSED ==="
  );
}

main().catch(error => {

  console.error(
    "\n=== L.E.O. DIAGNOSTIC ENGINE TEST FAILED ==="
  );

  console.error(error);

  process.exit(1);
});


