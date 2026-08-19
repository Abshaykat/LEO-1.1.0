import {
  executeRepair
} from "./repair-execution.ts";

import type {
  DiagnosticReport
} from "./diagnostic-types.ts";

import type {
  RepairPlan
} from "./repair-types.ts";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `REPAIR EXECUTION TEST FAILURE: ${message}`
    );
  }
}

async function main(): Promise<void> {

  console.log(
    "=== L.E.O. REPAIR EXECUTION TEST ==="
  );

  const failedReport: DiagnosticReport = {
    status: "failed",
    confidence: 100,
    checks: [
      {
        name: "TypeScript",
        status: "failed",
        message: "TypeScript compilation failed."
      }
    ],
    issues: [
      "TypeScript compilation failed."
    ],
    recommendations: [
      "Investigate: TypeScript"
    ],
    requiresApproval: false
  };

  const repairPlan: RepairPlan = {
    id: "test-repair-plan",
    status: "repair_available",
    issue:
      "TypeScript compilation failed.",
    rootCause:
      "Root cause requires verification.",
    confidence: 100,
    risk: "medium",
    steps: [
      {
        order: 1,
        description:
          "Investigate and prepare a repair.",
        rationale:
          "Repair requires owner review."
      }
    ],
    verification: [
      "Run TypeScript compilation."
    ],
    requiresApproval: true
  };

  const result = await executeRepair({
    plan: repairPlan,
    diagnosticReport: failedReport,
    toolName: "pc.run_command",
    parameters: {
      command: 'Write-Output "Repair bridge ready"',
      workingDirectory: "D:\\LEO"
    },
    reason:
      "Verify the repair execution boundary.",
    context: {
      source: "text",
      ownerAuthenticated: true
    },
    traceId: "repair-test-trace"
  });

  assert(
    result.decision === "require_approval",
    "Repair action did not enter owner approval."
  );

  if (result.decision === "require_approval") {
    assert(
      typeof result.approvalId === "string" &&
      result.approvalId.length > 0,
      "Repair approval ID was not created."
    );
  }

  console.log(
    "PASS: Repair action entered the approval boundary."
  );

  let healthyRejected = false;

  try {
    await executeRepair({
      plan: {
        ...repairPlan,
        status: "no_repair_needed"
      },
      diagnosticReport: {
        ...failedReport,
        status: "healthy"
      },
      toolName: "pc.run_command",
      parameters: {
        command: 'Write-Output "should not execute"',
        workingDirectory: "D:\\LEO"
      },
      reason: "Invalid healthy repair.",
      context: {
        source: "text",
        ownerAuthenticated: true
      }
    });
  } catch {
    healthyRejected = true;
  }

  assert(
    healthyRejected,
    "Healthy system was allowed to enter repair execution."
  );

  console.log(
    "PASS: Healthy repair execution was rejected."
  );

  console.log(
    "\n=== L.E.O. REPAIR EXECUTION TEST PASSED ==="
  );
}

main().catch(error => {

  console.error(
    "\n=== L.E.O. REPAIR EXECUTION TEST FAILED ==="
  );

  console.error(error);

  process.exit(1);
});
