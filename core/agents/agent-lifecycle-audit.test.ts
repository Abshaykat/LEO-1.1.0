import {
  createAgent,
  getAgent
} from "./agent-store.ts";

import {
  requestAgentUpdate,
  executeApprovedAgentUpdate
} from "./agent-update-governance.ts";

import {
  approveRequest
} from "../approvals/approval-engine.ts";

import {
  getTool
} from "../permissions/tool-registry.ts";

import {
  getAuditFilePath
} from "../audit/audit-logger.ts";

import {
  readFile
} from "node:fs/promises";

async function main(): Promise<void> {
  console.log("=== L.E.O. AGENT LIFECYCLE AUDIT / TRACE TEST ===");

  const agent = await createAgent({
    name: "B8 Audit Test Agent",
    purpose: "Verify lifecycle audit and decision trace governance.",
    instructions: "Test controlled lifecycle audit.",
    capabilities: [],
    permissions: [],
    securityPolicy: {
      allowExternalSystemActions: false,
      allowPermissionChanges: false,
      allowAgentCreation: false,
      allowAutonomousExecution: false
    }
  });

  console.log("PASS: Test agent created.");

  const pending = await requestAgentUpdate(
    agent.id,
    {
      name: "B8 Updated Audit Agent"
    }
  );

  if (pending.decision !== "require_approval") {
    throw new Error("Update did not require approval.");
  }

  console.log("PASS: Update requires owner approval.");

  await approveRequest(pending.approvalId);

  console.log("PASS: Owner approval recorded.");

  await executeApprovedAgentUpdate(
    agent.id,
    pending.approvalId
  );

  console.log("PASS: Approved update executed.");

  const updated = await getAgent(agent.id);

  if (!updated || updated.name !== "B8 Updated Audit Agent") {
    throw new Error("Updated agent state not verified.");
  }

  console.log("PASS: Updated agent verified.");

  const tool = getTool("agent.update");

  if (!tool) {
    throw new Error("agent.update registry entry missing.");
  }

  const auditContent =
    await readFile(
      getAuditFilePath(),
      "utf8"
    );

  const events =
    auditContent
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map(
        line =>
          JSON.parse(line) as Record<string, unknown>
      );

  const related = events.filter((event) => {
    const serialized = JSON.stringify(event);
    return serialized.includes(agent.id);
  });

  if (related.length === 0) {
    throw new Error(
      "No audit events were found for the lifecycle operation."
    );
  }

  console.log(
    `PASS: Lifecycle audit records found: ${related.length}`
  );

  const hasDecisionTrace = related.some(
    event =>
      event.type === "decision_trace"
  );

  if (!hasDecisionTrace) {
    throw new Error(
      "Lifecycle operation does not contain a decision trace."
    );
  }

  console.log("PASS: Decision trace record found.");

  const hasAgentUpdate = related.some(
    event => {
      const serialized = JSON.stringify(event);
      return (
        serialized.includes("agent.update") ||
        serialized.includes("lifecycle")
      );
    }
  );

  if (!hasAgentUpdate) {
    throw new Error(
      "Lifecycle audit records do not identify the agent update operation."
    );
  }

  console.log("PASS: Agent update operation identified.");

  console.log("=== AGENT LIFECYCLE AUDIT / TRACE TEST PASSED ===");
}

main().catch((error) => {
  console.error("STOP: B8 audit/trace test failed.");
  console.error(error);
  process.exit(1);
});