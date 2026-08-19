import {
  executeRepair
} from "./repair-execution.ts";

import {
  approveRequest
} from "../approvals/approval-engine.ts";

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
      `REPAIR TAMPER TEST FAILURE: ${message}`
    );
  }
}

async function main(): Promise<void> {

  console.log(
    "=== L.E.O. REPAIR TAMPER SECURITY TEST ==="
  );

  const diagnosticReport: DiagnosticReport = {
    status: "failed",
    confidence: 100,

    checks: [
      {
        name: "Repair Check",
        status: "failed",
        message: "Controlled repair is required."
      }
    ],

    issues: [
      "Controlled repair is required."
    ],

    recommendations: [
      "Prepare repair."
    ],

    requiresApproval: false
  };

  const repairPlan: RepairPlan = {
    id: "repair-tamper-test",
    status: "repair_available",
    issue: "Controlled repair is required.",
    rootCause: "Requires verification.",
    confidence: 100,
    risk: "medium",

    steps: [
      {
        order: 1,
        description: "Run approved repair.",
        rationale: "Owner approval is required."
      }
    ],

    verification: [
      "Verify repair result."
    ],

    requiresApproval: true
  };

  const originalParameters = {
    command:
      'Write-Output "ORIGINAL REPAIR"',
    workingDirectory:
      "D:\\LEO"
  };

  const pending =
    await executeRepair({
      plan: repairPlan,
      diagnosticReport,
      toolName: "pc.run_command",
      parameters: originalParameters,
      reason: "Original approved repair.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      traceId: "repair-tamper-test"
    });

  assert(
    pending.decision === "require_approval",
    "Repair did not require approval."
  );

  if (pending.decision !== "require_approval") {
    throw new Error(
      "Expected approval-required decision."
    );
  }

  await approveRequest(
    pending.approvalId,
    "repair-tamper-test"
  );

  console.log(
    "PASS: Original repair was approved."
  );

  /*
   * Tamper the approved parameters.
   */
  const tamperedParameters = {
    command:
      'Write-Output "TAMPERED REPAIR"',
    workingDirectory:
      "D:\\LEO"
  };

  let tamperRejected = false;

  try {
    await executeRepair({
      plan: repairPlan,
      diagnosticReport,
      toolName: "pc.run_command",
      parameters: tamperedParameters,
      reason: "Tampered repair attempt.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      approvalId: pending.approvalId,
      traceId: "repair-tamper-test"
    });
  } catch (error) {

    tamperRejected = true;

    console.log(
      `Tampered repair rejected: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }

  assert(
    tamperRejected,
    "Tampered repair was accepted."
  );

  console.log(
    "PASS: Modified repair parameters were rejected."
  );

  console.log(
    "\n=== L.E.O. REPAIR TAMPER SECURITY TEST PASSED ==="
  );
}

main().catch(error => {

  console.error(
    "\n=== L.E.O. REPAIR TAMPER SECURITY TEST FAILED ==="
  );

  console.error(error);

  process.exit(1);
});
