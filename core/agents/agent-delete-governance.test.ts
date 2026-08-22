import {
  createAgent,
  getAgent,
  deleteAgent
} from "./agent-store.ts";

import {
  requestAgentDelete,
  executeApprovedAgentDelete
} from "./agent-delete-governance.ts";

import {
  approveRequest
} from "../approvals/approval-engine.ts";

async function main() {
  console.log("=== L.E.O. AGENT DELETE GOVERNANCE TEST ===");

  const agent = await createAgent({
    name: "B7 Delete Test Agent",
    purpose: "Verify controlled agent deletion governance.",
    instructions: "Test-only agent.",
    capabilities: [],
    permissions: []
  });

  console.log("PASS: Test agent created.");

  const existing = await getAgent(agent.id);

  if (!existing) {
    throw new Error("Test agent was not persisted.");
  }

  console.log("PASS: Test agent persisted.");

  const pending = await requestAgentDelete(agent.id);

  if (pending.decision !== "require_approval") {
    throw new Error("Delete request did not require owner approval.");
  }

  console.log("PASS: Delete request requires owner approval.");

  const beforeApproval = await getAgent(agent.id);

  if (!beforeApproval) {
    throw new Error("Agent disappeared before approval.");
  }

  console.log("PASS: Agent remains present before approval.");

  let rejected = false;

  try {
    await executeApprovedAgentDelete(
      agent.id,
      "invalid-approval-id"
    );
  } catch {
    rejected = true;
  }

  if (!rejected) {
    throw new Error("Invalid approval unexpectedly deleted agent.");
  }

  console.log("PASS: Invalid approval cannot delete agent.");

  const afterInvalid = await getAgent(agent.id);

  if (!afterInvalid) {
    throw new Error("Agent changed after invalid approval.");
  }

  console.log("PASS: Agent remains after invalid approval.");

  await approveRequest(pending.approvalId);

  console.log("PASS: Owner approval recorded.");

  await executeApprovedAgentDelete(
    agent.id,
    pending.approvalId
  );

  console.log("PASS: Approved delete executed.");

  const deleted = await getAgent(agent.id);

  if (deleted !== null) {
    throw new Error("Deleted agent still exists.");
  }

  console.log("PASS: Deleted agent no longer exists.");

  let reused = false;

  try {
    await executeApprovedAgentDelete(
      agent.id,
      pending.approvalId
    );
  } catch {
    reused = true;
  }

  if (!reused) {
    throw new Error("Consumed delete approval was reusable.");
  }

  console.log("PASS: Consumed delete approval cannot be reused.");

  let missing = false;

  try {
    await requestAgentDelete(agent.id);
  } catch {
    missing = true;
  }

  if (!missing) {
    throw new Error("Missing agent unexpectedly accepted delete request.");
  }

  console.log("PASS: Missing agent delete request rejected.");

  console.log("=== AGENT DELETE GOVERNANCE TEST PASSED ===");
}

main().catch((error) => {
  console.error("STOP: Delete governance test failed.");
  console.error(error);
  process.exit(1);
});