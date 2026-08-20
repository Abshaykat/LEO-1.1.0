import {
  createApprovalRequest,
  consumeApproval
} from "../approvals/approval-engine.ts";

import {
  getTool
} from "../permissions/tool-registry.ts";

import {
  getAgent,
  transitionAgentLifecycle
} from "./agent-store.ts";

export interface AgentDisableRequest {
  decision: "require_approval";
  approvalId: string;
}

export async function requestAgentDisable(
  agentId: string
): Promise<AgentDisableRequest> {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  if (agent.status !== "active") {
    throw new Error(
      `Agent cannot be disabled from status: ${agent.status}.`
    );
  }

  const tool = getTool("agent.disable");

  if (!tool) {
    throw new Error(
      "agent.disable tool is not registered."
    );
  }

  const approval = await createApprovalRequest(
    tool,
    { agentId },
    `Disable L.E.O. agent ${agentId}.`
  );

  return {
    decision: "require_approval",
    approvalId: approval.id
  };
}

export async function executeApprovedAgentDisable(
  agentId: string,
  approvalId: string
) {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  if (agent.status !== "active") {
    throw new Error(
      `Agent cannot be disabled from status: ${agent.status}.`
    );
  }

  const tool = getTool("agent.disable");

  if (!tool) {
    throw new Error(
      "agent.disable tool is not registered."
    );
  }

  await consumeApproval(
    approvalId,
    tool.name,
    { agentId }
  );

  return transitionAgentLifecycle(
    agentId,
    "disabled"
  );
}