import assert from "node:assert/strict";
import {
  approveRequest
} from "../approvals/approval-engine.ts";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";

import {
  createAgent,
  getAgent,
  transitionAgentLifecycle
} from "./agent-store.ts";

import {
  requestAgentArchive,
  executeApprovedAgentArchive
} from "./agent-archive-governance.ts";

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

async function createTestAgent(
  name: string
) {
  return createAgent({
    name: `${name} ${randomUUID()}`,
    purpose: "Controlled archive governance test.",
    instructions: "Archiving requires owner approval."
  });
}

async function main(): Promise<void> {
  console.log("=== L.E.O. AGENT ARCHIVE GOVERNANCE TEST ===");

  await mkdir(AGENT_ROOT, { recursive: true });

  const agentIds: string[] = [];

  try {
    const draft = await createTestAgent("Archive Draft Test");
    agentIds.push(draft.id);

    assert.equal(draft.status, "draft");
    console.log("PASS: Draft test agent starts in draft.");

    const pendingDraft = await requestAgentArchive(draft.id);

    assert.equal(
      pendingDraft.decision,
      "require_approval",
      "Archive request must require owner approval."
    );

    assert.ok(
      pendingDraft.approvalId,
      "Archive approval ID must be returned."
    );

    console.log("PASS: Draft archive request requires owner approval.");

    const beforeDraftApproval = await getAgent(draft.id);

    assert.ok(beforeDraftApproval);
    assert.equal(
      beforeDraftApproval.status,
      "draft",
      "Draft agent must remain unchanged before approval."
    );

    console.log("PASS: Draft agent remains unchanged before approval.");

    await expectReject(
      () => executeApprovedAgentArchive(
        draft.id,
        "invalid-approval-id"
      ),
      "Invalid archive approval must be rejected."
    );

    const rejectedDraft = await getAgent(draft.id);

    assert.ok(rejectedDraft);
    assert.equal(
      rejectedDraft.status,
      "draft",
      "Rejected archive attempt must not mutate lifecycle."
    );

    console.log("PASS: Invalid archive approval cannot archive draft.");

    await approveRequest(
      pendingDraft.approvalId,
      "phase-2.3b5-archive-draft-test"
    );

    const archivedDraft = await executeApprovedAgentArchive(
      draft.id,
      pendingDraft.approvalId
    );

    assert.equal(
      archivedDraft.status,
      "archived",
      "Approved archive must transition draft -> archived."
    );

    console.log("PASS: Approved archive transitions draft -> archived.");

    assert.deepEqual(
      archivedDraft.capabilities,
      draft.capabilities,
      "Capabilities must remain unchanged."
    );

    assert.deepEqual(
      archivedDraft.permissions,
      draft.permissions,
      "Permissions must remain unchanged."
    );

    assert.deepEqual(
      archivedDraft.securityPolicy,
      draft.securityPolicy,
      "Security policy must remain unchanged."
    );

    console.log(
      "PASS: Archive preserves capabilities, permissions and security policy."
    );

    await expectReject(
      () => executeApprovedAgentArchive(
        draft.id,
        pendingDraft.approvalId
      ),
      "Consumed archive approval must not be reusable."
    );

    console.log("PASS: Consumed archive approval cannot be reused.");

    await expectReject(
      () => requestAgentArchive(draft.id),
      "Already-archived agent must not be archived again."
    );

    console.log("PASS: Same-state archive is rejected.");

    const active = await createTestAgent("Archive Active Test");
    agentIds.push(active.id);

    await transitionAgentLifecycle(active.id, "active");

    const pendingActive = await requestAgentArchive(active.id);

    assert.ok(pendingActive.approvalId);
    console.log("PASS: Active archive request requires approval.");

    await approveRequest(
      pendingActive.approvalId,
      "phase-2.3b5-archive-active-test"
    );

    const archivedActive = await executeApprovedAgentArchive(
      active.id,
      pendingActive.approvalId
    );

    assert.equal(
      archivedActive.status,
      "archived",
      "Approved archive must transition active -> archived."
    );

    console.log("PASS: Approved archive transitions active -> archived.");

    const disabled = await createTestAgent("Archive Disabled Test");
    agentIds.push(disabled.id);

    await transitionAgentLifecycle(disabled.id, "active");
    await transitionAgentLifecycle(disabled.id, "disabled");

    const pendingDisabled = await requestAgentArchive(disabled.id);

    assert.ok(pendingDisabled.approvalId);
    console.log("PASS: Disabled archive request requires approval.");

    await approveRequest(
      pendingDisabled.approvalId,
      "phase-2.3b5-archive-disabled-test"
    );

    const archivedDisabled = await executeApprovedAgentArchive(
      disabled.id,
      pendingDisabled.approvalId
    );

    assert.equal(
      archivedDisabled.status,
      "archived",
      "Approved archive must transition disabled -> archived."
    );

    console.log(
      "PASS: Approved archive transitions disabled -> archived."
    );

    console.log("=== AGENT ARCHIVE GOVERNANCE TEST PASSED ===");
  } finally {
    for (const id of agentIds) {
      await rm(
        `${AGENT_ROOT}\\${id}.json`,
        { force: true }
      );
    }
  }
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});