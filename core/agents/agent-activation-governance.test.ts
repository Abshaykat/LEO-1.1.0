import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { approveRequest } from "../approvals/approval-engine.ts";
import { mkdir, rm } from "node:fs/promises";

import {
  createAgent
} from "./agent-store.ts";
import {
  getAgent
} from "./agent-store.ts";
import {
  AGENT_ROOT
} from "../config/leo-config.ts";
import {
  requestAgentActivation,
  executeApprovedAgentActivation
} from "./agent-activation-governance.ts";

async function expectReject(
  action: () => Promise<unknown>,
  message: string
): Promise<void> {
  let rejected = false;

  try {
    await action();
  } catch {
    rejected = true;
  }

  assert.equal(rejected, true, message);
}

async function main(): Promise<void> {
  console.log("=== L.E.O. AGENT ACTIVATION GOVERNANCE TEST ===");

  await mkdir(AGENT_ROOT, { recursive: true });

  const agent = await createAgent({
    name: `Activation Test ${randomUUID()}`,
    purpose: "Controlled activation governance test.",
    instructions: "Activation requires owner approval."
  });

  try {
    assert.equal(agent.status, "draft");
    console.log("PASS: Test agent starts in draft.");

    const pending = await requestAgentActivation(agent.id);

    assert.equal(
      pending.decision,
      "require_approval",
      "Activation must require owner approval."
    );

    assert.ok(
      pending.approvalId,
      "Approval ID must be returned."
    );

    console.log("PASS: Activation request requires owner approval.");

    const beforeApproval = await getAgent(agent.id);

    assert.ok(beforeApproval);
    assert.equal(
      beforeApproval.status,
      "draft",
      "Agent must remain draft before approval."
    );

    console.log("PASS: Agent remains draft before approval.");

    await expectReject(
      () => executeApprovedAgentActivation(
        agent.id,
        "invalid-approval-id"
      ),
      "Invalid approval must be rejected."
    );

    const afterRejectedAttempt = await getAgent(agent.id);

    assert.ok(afterRejectedAttempt);
    assert.equal(
      afterRejectedAttempt.status,
      "draft",
      "Rejected approval attempt must not mutate lifecycle."
    );

    console.log("PASS: Invalid approval cannot activate agent.");

    await approveRequest(
      pending.approvalId,
      "phase-2.3b3-activation-test"
    );

    const approved = await executeApprovedAgentActivation(
      agent.id,
      pending.approvalId
    );

    assert.equal(
      approved.status,
      "active",
      "Approved activation must transition draft -> active."
    );

    console.log("PASS: Approved activation transitions draft -> active.");

    assert.equal(
      approved.capabilities.join("|"),
      agent.capabilities.join("|"),
      "Capabilities must remain unchanged."
    );

    assert.deepEqual(
      approved.permissions,
      agent.permissions,
      "Permissions must remain unchanged."
    );

    assert.deepEqual(
      approved.securityPolicy,
      agent.securityPolicy,
      "Security policy must remain unchanged."
    );

    console.log("PASS: Activation preserves capabilities, permissions and security policy.");

    await expectReject(
      () => executeApprovedAgentActivation(
        agent.id,
        pending.approvalId
      ),
      "Consumed approval must not be reusable."
    );

    console.log("PASS: Consumed activation approval cannot be reused.");

    await expectReject(
      () => requestAgentActivation(agent.id),
      "Already-active agent must not be activated again."
    );

    console.log("PASS: Same-state activation is rejected.");

    console.log("=== AGENT ACTIVATION GOVERNANCE TEST PASSED ===");
  } finally {
    await rm(
      `${AGENT_ROOT}\\${agent.id}.json`,
      { force: true }
    );
  }
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});