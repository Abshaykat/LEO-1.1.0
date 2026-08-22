import assert from "node:assert/strict";

import {
  approveRequest
} from "../approvals/approval-engine.ts";

import {
  createAgent,
  getAgent,
  deleteAgent
} from "./agent-store.ts";

import {
  requestAgentUpdate,
  executeApprovedAgentUpdate
} from "./agent-update-governance.ts";

async function main(): Promise<void> {
  console.log("=== L.E.O. AGENT UPDATE GOVERNANCE TEST ===");

  const agent = await createAgent({
    name: "Update Governance Test",
    purpose: "Test controlled agent configuration updates.",
    instructions: "Use only approved configuration.",
    capabilities: ["web.search"],
    permissions: ["internet_access"],
    securityPolicy: {
      allowExternalSystemActions: false,
      allowPermissionChanges: false,
      allowAgentCreation: false,
      allowAutonomousExecution: false
    }
  });

  try {
    assert.equal(
      agent.status,
      "draft"
    );

    assert.equal(
      agent.version,
      1
    );

    console.log(
      "PASS: Test agent created in draft."
    );

    const pending = await requestAgentUpdate(
      agent.id,
      {
        name: "Updated Agent Name",
        purpose: "Updated controlled purpose.",
        instructions: "Updated approved instructions."
      }
    );

    assert.equal(
      pending.decision,
      "require_approval"
    );

    assert.ok(
      pending.approvalId
    );

    console.log(
      "PASS: Update request requires owner approval."
    );

    const beforeApproval = await getAgent(
      agent.id
    );

    assert.ok(
      beforeApproval
    );

    assert.equal(
      beforeApproval.name,
      agent.name
    );

    assert.equal(
      beforeApproval.version,
      1
    );

    console.log(
      "PASS: Agent remains unchanged before approval."
    );

    await assert.rejects(
      () =>
        executeApprovedAgentUpdate(
          agent.id,
          pending.approvalId
        )
    );

    const afterRejectedAttempt = await getAgent(
      agent.id
    );

    assert.ok(
      afterRejectedAttempt
    );

    assert.equal(
      afterRejectedAttempt.name,
      agent.name
    );

    assert.equal(
      afterRejectedAttempt.version,
      1
    );

    console.log(
      "PASS: Unapproved update cannot mutate agent."
    );

    await approveRequest(
      pending.approvalId
    );

    const updated = await executeApprovedAgentUpdate(
      agent.id,
      pending.approvalId
    );

    assert.equal(
      updated.name,
      "Updated Agent Name"
    );

    assert.equal(
      updated.purpose,
      "Updated controlled purpose."
    );

    assert.equal(
      updated.instructions,
      "Updated approved instructions."
    );

    assert.equal(
      updated.version,
      agent.version + 1
    );

    console.log(
      "PASS: Approved update changes approved fields."
    );

    assert.deepEqual(
      updated.capabilities,
      agent.capabilities
    );

    assert.deepEqual(
      updated.permissions,
      agent.permissions
    );

    assert.deepEqual(
      updated.securityPolicy,
      agent.securityPolicy
    );

    assert.equal(
      updated.status,
      agent.status
    );

    console.log(
      "PASS: Update preserves lifecycle, capabilities, permissions and security policy."
    );

    await assert.rejects(
      () =>
        executeApprovedAgentUpdate(
          agent.id,
          pending.approvalId
        )
    );

    console.log(
      "PASS: Consumed update approval cannot be reused."
    );

    const persisted = await getAgent(
      agent.id
    );

    assert.ok(
      persisted
    );

    assert.equal(
      persisted.name,
      "Updated Agent Name"
    );

    assert.equal(
      persisted.version,
      updated.version
    );

    console.log(
      "PASS: Updated agent persists correctly."
    );

    console.log(
      "=== AGENT UPDATE GOVERNANCE TEST PASSED ==="
    );
  } finally {
    await deleteAgent(
      agent.id
    );
  }
}

main().catch(error => {
  console.error(
    error instanceof Error
      ? error.message
      : String(error)
  );

  process.exitCode = 1;
});