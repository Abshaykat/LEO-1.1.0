import {
  DiagnosticEngine
} from "./diagnostic-engine.ts";

import {
  RepairPlanner
} from "./repair-planner.ts";

import {
  executeRepair
} from "./repair-execution.ts";

import {
  approveRequest
} from "../approvals/approval-engine.ts";

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
      `REPAIR E2E TEST FAILURE: ${message}`
    );
  }
}

class TestDiagnosticProvider
  implements DiagnosticProvider {

  async runChecks(): Promise<DiagnosticCheck[]> {
    return [
      {
        name: "Controlled Repair Check",
        status: "failed",
        message:
          "Controlled repair is required.",
        evidence: [
          "Integration test diagnostic failure."
        ]
      }
    ];
  }
}

async function main(): Promise<void> {

  console.log(
    "=== L.E.O. REPAIR END-TO-END INTEGRATION TEST ==="
  );

  const traceId =
    "repair-e2e-integration-test";

  /*
   * STEP 1: Diagnostic
   */
  const diagnosticEngine =
    new DiagnosticEngine(
      new TestDiagnosticProvider()
    );

  const diagnostic =
    await diagnosticEngine.diagnose();

  assert(
    diagnostic.status === "failed",
    "Diagnostic failure was not detected."
  );

  assert(
    diagnostic.confidence === 100,
    "Diagnostic confidence was not 100%."
  );

  console.log(
    "PASS: Diagnostic failure detected."
  );

  /*
   * STEP 2: Repair planning
   */
  const planner =
    new RepairPlanner();

  const plan =
    planner.createPlan(
      diagnostic
    );

  assert(
    plan.status === "repair_available",
    "Repair plan was not created."
  );

  assert(
    plan.requiresApproval === true,
    "Repair plan does not require approval."
  );

  assert(
    plan.steps.length > 0,
    "Repair plan contains no actionable steps."
  );

  console.log(
    "PASS: Repair plan created with approval requirement."
  );

  /*
   * STEP 3: First execution attempt
   */
  const parameters = {
    command:
      'Write-Output "L.E.O. repair E2E verified"',
    workingDirectory:
      "D:\\LEO"
  };

  const pending =
    await executeRepair({
      plan,
      diagnosticReport: diagnostic,
      toolName: "pc.run_command",
      parameters,
      reason:
        "Execute the verified repair plan.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      traceId
    });

  assert(
    pending.decision === "require_approval",
    "Repair bypassed owner approval."
  );

  if (pending.decision !== "require_approval") {
    throw new Error(
      "Expected repair approval requirement."
    );
  }

  console.log(
    "PASS: Repair entered owner approval boundary."
  );

  /*
   * STEP 4: Owner approval
   */
  const approval =
    await approveRequest(
      pending.approvalId,
      traceId
    );

  assert(
    approval.status === "approved",
    "Owner approval was not recorded."
  );

  assert(
    approval.actionHash.length > 0,
    "Approval action hash is missing."
  );

  console.log(
    "PASS: Owner approval recorded with action hash."
  );

  /*
   * STEP 5: Exact approved execution
   */
  const execution =
    await executeRepair({
      plan,
      diagnosticReport: diagnostic,
      toolName: "pc.run_command",
      parameters,
      reason:
        "Execute the verified repair plan.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      approvalId:
        pending.approvalId,
      traceId
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
    "PASS: Exact approved repair executed."
  );

  /*
   * STEP 6: Verification
   */
  const result =
    execution.result as {
      stdout: string;
      stderr: string;
      exitCode: number;
    };

  assert(
    result.exitCode === 0,
    "Repair execution did not exit successfully."
  );

  assert(
    result.stdout.includes(
      "L.E.O. repair E2E verified"
    ),
    "Repair verification output is incorrect."
  );

  console.log(
    "PASS: Repair execution result verified."
  );

  /*
   * STEP 7: Approval reuse protection
   */
  let reuseRejected = false;

  try {
    await executeRepair({
      plan,
      diagnosticReport: diagnostic,
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
      traceId
    });
  } catch {
    reuseRejected = true;
  }

  assert(
    reuseRejected,
    "Consumed repair approval was reusable."
  );

  console.log(
    "PASS: Consumed repair approval reuse rejected."
  );

  /*
   * STEP 8: Tamper protection
   *
   * A fresh approval is created so the tamper test
   * does not depend on the already-consumed approval.
   */
  const secondParameters = {
    command:
      'Write-Output "ORIGINAL REPAIR"',
    workingDirectory:
      "D:\\LEO"
  };

  const secondPending =
    await executeRepair({
      plan,
      diagnosticReport: diagnostic,
      toolName: "pc.run_command",
      parameters: secondParameters,
      reason:
        "Create approval for tamper verification.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      traceId:
        `${traceId}-tamper`
    });

  assert(
    secondPending.decision === "require_approval",
    "Second repair did not require approval."
  );

  if (secondPending.decision !== "require_approval") {
    throw new Error(
      "Expected second approval requirement."
    );
  }

  await approveRequest(
    secondPending.approvalId,
    `${traceId}-tamper`
  );

  let tamperRejected = false;

  try {
    await executeRepair({
      plan,
      diagnosticReport: diagnostic,
      toolName: "pc.run_command",
      parameters: {
        command:
          'Write-Output "TAMPERED REPAIR"',
        workingDirectory:
          "D:\\LEO"
      },
      reason:
        "Tampered repair attempt.",
      context: {
        source: "text",
        ownerAuthenticated: true
      },
      approvalId:
        secondPending.approvalId,
      traceId:
        `${traceId}-tamper`
    });
  } catch {
    tamperRejected = true;
  }

  assert(
    tamperRejected,
    "Tampered repair action was accepted."
  );

  console.log(
    "PASS: Tampered repair action rejected."
  );

  console.log(
    "\n=== L.E.O. REPAIR END-TO-END INTEGRATION TEST PASSED ==="
  );
}

main().catch(error => {

  console.error(
    "\n=== L.E.O. REPAIR END-TO-END INTEGRATION TEST FAILED ==="
  );

  console.error(error);

  process.exit(1);
});
