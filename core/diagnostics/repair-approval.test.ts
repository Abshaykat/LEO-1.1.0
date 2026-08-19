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
      `REPAIR APPROVAL TEST FAILURE: ${message}`
    );
  }
}

async function main(): Promise<void> {

  console.log(
    "=== L.E.O. REPAIR APPROVAL ROUND-TRIP TEST ==="
  );

  const diagnosticReport: DiagnosticReport = {
    status: "failed",

    confidence: 100,

    checks: [
      {
        name: "Repair Verification",
        status: "failed",
        message:
          "Repair verification is required."
      }
    ],

    issues: [
      "Repair verification is required."
    ],

    recommendations: [
      "Prepare and verify the repair."
    ],

    requiresApproval: false
  };

  const repairPlan: RepairPlan = {
    id: "repair-round-trip-test",

    status: "repair_available",

    issue:
      "Repair verification is required.",

    rootCause:
      "Root cause requires verification.",

    confidence: 100,

    risk: "medium",

    steps: [
      {
        order: 1,
        description:
          "Run the controlled repair verification command.",
        rationale:
          "The repair must be explicitly approved."
      }
    ],

    verification: [
      "Confirm command output.",
      "Run regression tests."
    ],

    requiresApproval: true
  };

  const parameters = {
    command:
      'Write-Output "L.E.O. repair approved"',
    workingDirectory:
      "D:\\LEO"
  };

  /*
   * STEP 1:
   * Repair must request owner approval.
   */
  const pending =
    await executeRepair({
      plan: repairPlan,
      diagnosticReport,
      toolName: "pc.run_command",
      parameters,
      reason:
        "Verify approved repair execution.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      traceId:
        "repair-round-trip-test"
    });

  assert(
    pending.decision === "require_approval",
    "Repair did not require owner approval."
  );

  if (pending.decision !== "require_approval") {
    throw new Error(
      "Expected an approval-required decision."
    );
  }

  assert(
    pending.approvalId.length > 0,
    "Repair approval ID was not created."
  );

  console.log(
    "PASS: Repair entered owner approval."
  );

  /*
   * STEP 2:
   * Explicit owner approval.
   */
  const approved =
    await approveRequest(
      pending.approvalId,
      "repair-round-trip-test"
    );

  assert(
    approved.status === "approved",
    "Repair approval was not recorded."
  );

  console.log(
    "PASS: Owner approval recorded."
  );

  /*
   * STEP 3:
   * Submit the exact same repair action.
   */
  const execution =
    await executeRepair({
      plan: repairPlan,
      diagnosticReport,
      toolName: "pc.run_command",
      parameters,
      reason:
        "Verify approved repair execution.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      approvalId:
        pending.approvalId,
      traceId:
        "repair-round-trip-test"
    });

  assert(
    execution.decision === "allow",
    "Approved repair did not execute."
  );

  if (execution.decision !== "allow") {
    throw new Error(
      "Expected approved repair execution."
    );
  }

  console.log(
    "PASS: Exact approved repair reached execution."
  );

  /*
   * STEP 4:
   * Verify execution result.
   */
  const result =
    execution.result as {
      stdout: string;
      stderr: string;
      exitCode: number;
    };

  assert(
    result.exitCode === 0,
    "Repair command did not exit successfully."
  );

  assert(
    result.stdout.includes(
      "L.E.O. repair approved"
    ),
    "Repair verification output was not returned."
  );

  console.log(
    "PASS: Repair execution result verified."
  );

  /*
   * STEP 5:
   * Approval must not be reusable.
   */
  let reuseRejected = false;

  try {
    await executeRepair({
      plan: repairPlan,
      diagnosticReport,
      toolName: "pc.run_command",
      parameters,
      reason:
        "Attempt to reuse consumed repair approval.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      approvalId:
        pending.approvalId,
      traceId:
        "repair-round-trip-reuse-test"
    });
  } catch {
    reuseRejected = true;
  }

  assert(
    reuseRejected,
    "Consumed repair approval was reusable."
  );

  console.log(
    "PASS: Consumed repair approval cannot be reused."
  );

  console.log(
    "\n=== L.E.O. REPAIR APPROVAL ROUND-TRIP PASSED ==="
  );
}

main().catch(error => {

  console.error(
    "\n=== L.E.O. REPAIR APPROVAL ROUND-TRIP FAILED ==="
  );

  console.error(error);

  process.exit(1);
});
