import assert from "node:assert/strict";

import {
  runWorkflow,
  resumeWorkflow
} from "./workflow-runner.ts";

import {
  loadPausedWorkflow,
  deletePersistedWorkflow
} from "./workflow-store.ts";

import {
  executePlannedActionForWorkflow
} from "./workflow-action-adapter.ts";

import type {
  WorkflowDefinition,
  WorkflowState
} from "./workflow.ts";

import type {
  PlannedAction
} from "../actions/action-plan.ts";

async function main() {

  console.log(
    "=== L.E.O. WORKFLOW APPROVAL EXECUTION INTEGRATION TEST ==="
  );

  interface State extends WorkflowState {
    executed: boolean;
  }

  const action: PlannedAction = {
    toolName: "pc.run_command",
    parameters: {
      command: 'Write-Output "Workflow integration test"',
      workingDirectory: "D:\\LEO"
    },
    reason:
      "Verify workflow approval and execution integration."
  };

  const definition:
    WorkflowDefinition<State> = {

    id:
      "test-workflow-approval-execution",

    startNodeId:
      "execution-node",

    nodes: {

      "execution-node": {

        id:
          "execution-node",

        async run({
          state,
          approvalId
        }) {

          const result =
            await executePlannedActionForWorkflow({

              action,

              context: {
                source: "system",
                ownerAuthenticated: true
              },

              approvalId
            });

          assert.equal(
            result.decision,
            "allow"
          );

          return {
            state: {
              ...state,
              executed: true
            },

            output:
              result.result
          };
        }
      }
    }
  };

  /*
   * 1. Start workflow.
   */

  const paused =
    await runWorkflow(
      definition,
      {
        executed: false
      }
    );

  assert.equal(
    paused.status,
    "paused"
  );

  assert.ok(
    paused.pendingApprovalId
  );

  assert.equal(
    paused.currentNodeId,
    "execution-node"
  );

  console.log(
    "PASS: Workflow paused for owner approval."
  );

  /*
   * 2. Verify workflow state persisted.
   */

  const stored =
    await loadPausedWorkflow<State>(
      definition.id
    );

  assert.ok(
    stored
  );

  assert.equal(
    stored?.status,
    "paused"
  );

  assert.equal(
    stored?.pendingApprovalId,
    paused.pendingApprovalId
  );

  console.log(
    "PASS: Paused workflow persisted."
  );

  /*
   * 4. Load the approval directly and approve it.
   */

  const {
    approveRequest,
    getApprovalRequest
  } = await import(
    "../approvals/approval-engine.ts"
  );

  const approvalId =
    paused.pendingApprovalId!;

  const approval =
    await getApprovalRequest(
      approvalId
    );

  assert.ok(
    approval
  );

  assert.equal(
    approval?.status,
    "pending"
  );

  await approveRequest(
    approvalId
  );

  const approved =
    await getApprovalRequest(
      approvalId
    );

  assert.ok(
    approved
  );

  assert.equal(
    approved?.status,
    "approved"
  );

  console.log(
    "PASS: Owner approval persisted."
  );

  /*
   * 5. Resume after owner approval.
   */

  const completed =
    await resumeWorkflow(
      definition,
      stored!
    );

  assert.equal(
    completed.status,
    "completed"
  );

  assert.equal(
    completed.state.executed,
    true
  );

  console.log(
    "PASS: Approved workflow resumed and executed."
  );

  /*
   * 6. Verify approval was consumed.
   */

  const consumed =
    await getApprovalRequest(
      approvalId
    );

  assert.ok(
    consumed
  );

  assert.equal(
    consumed?.status,
    "consumed"
  );

  console.log(
    "PASS: Approval consumed after execution."
  );

  console.log(
    "\n=== WORKFLOW APPROVAL EXECUTION INTEGRATION TEST PASSED ==="
  );
}

main().catch((error) => {

  console.error(
    "\n=== WORKFLOW APPROVAL EXECUTION INTEGRATION TEST FAILED ==="
  );

  console.error(error);

  process.exitCode = 1;

}).finally(async () => {

  await deletePersistedWorkflow(
    "test-workflow-approval-execution"
  );

});
