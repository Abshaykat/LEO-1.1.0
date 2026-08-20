import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";

import {
  approveRequest
} from "../approvals/approval-engine.ts";

import {
  createAgent,
  getAgent,
  transitionAgentLifecycle
} from "./agent-store.ts";

import {
  requestAgentDisable,
  executeApprovedAgentDisable
} from "./agent-disable-governance.ts";

import {
  AGENT_ROOT
} from "../config/leo-config.ts";

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
  console.log("=== L.E.O. AGENT DISABLE GOVERNANCE TEST ===");

  await mkdir(AGENT_ROOT, { recursive: true });

  const agent = await createAgent({
    name: `Disable Test ${randomUUID()}`,
    purpose: "Controlled disable governance test.",
    instructions: "Disabling requires owner approval."
  });

  try {
    const active = await transitionAgentLifecycle(
      agent.id,
      "active"
    );

    assert.equal(
      active.status,
      "active",
      "Test agent must start disable test in active state."
    );

    console.log("PASS: Test agent is active.");

    const pending = await requestAgentDisable(agent.id);

    assert.equal(
      pending.decision,
      "require_approval",
      "Disable must require owner approval."
    );

    assert.ok(
      pending.approvalId,
      "Disable approval ID must be returned."
    );

    console.log("PASS: Disable request requires owner approval.");

    const beforeApproval = await getAgent(agent.id);

    assert.ok(beforeApproval);
    assert.equal(
      beforeApproval.status,
      "active",
      "Agent must remain active before approval."
    );

    console.log("PASS: Agent remains active before approval.");

    await expectReject(
      () => executeApprovedAgentDisable(
        agent.id,
        "invalid-approval-id"
      ),
      "Invalid approval must be rejected."
    );

    const afterRejectedAttempt = await getAgent(agent.id);

    assert.ok(afterRejectedAttempt);
    assert.equal(
      afterRejectedAttempt.status,
      "active",
      "Rejected approval attempt must not mutate lifecycle."
    );

    console.log("PASS: Invalid approval cannot disable agent.");

    await approveRequest(
      pending.approvalId,
      "phase-2.3b4-disable-test"
    );

    const disabled = await executeApprovedAgentDisable(
      agent.id,
      pending.approvalId
    );

    assert.equal(
      disabled.status,
      "disabled",
      "Approved disable must transition active -> disabled."
    );

    console.log("PASS: Approved disable transitions active -> disabled.");

    assert.equal(
      disabled.capabilities.join("|"),
      active.capabilities.join("|"),
      "Capabilities must remain unchanged."
    );

    assert.deepEqual(
      disabled.permissions,
      active.permissions,
      "Permissions must remain unchanged."
    );

    assert.deepEqual(
      disabled.securityPolicy,
      active.securityPolicy,
      "Security policy must remain unchanged."
    );

    assert.equal(
      disabled.version,
      active.version + 1,
      "Disable must increment lifecycle version."
    );

    console.log(
      "PASS: Disable preserves capabilities, permissions and security policy."
    );

    await expectReject(
      () => executeApprovedAgentDisable(
        agent.id,
        pending.approvalId
      ),
      "Consumed approval must not be reusable."
    );

    console.log(
      "PASS: Consumed disable approval cannot be reused."
    );

    await expectReject(
      () => requestAgentDisable(agent.id),
      "Already-disabled agent must not be disabled again."
    );

    console.log(
      "PASS: Same-state disable is rejected."
    );

    console.log("=== AGENT DISABLE GOVERNANCE TEST PASSED ===");
  } finally {
    await rm(
      `${AGENT_ROOT}\\${agent.id}.json`,
      { force: true }
    );
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});