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

export interface AgentArchiveRequest {
  decision: "require_approval";
  approvalId: string;
}

export async function requestAgentArchive(
  agentId: string
): Promise<AgentArchiveRequest> {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  if (
    agent.status !== "draft" &&
    agent.status !== "active" &&
    agent.status !== "disabled"
  ) {
    throw new Error(
      `Agent cannot be archived from status: ${agent.status}.`
    );
  }

  const tool = getTool("agent.archive");

  if (!tool) {
    throw new Error(
      "agent.archive tool is not registered."
    );
  }

  const approval = await createApprovalRequest(
    tool,
    { agentId },
    `Archive L.E.O. agent ${agentId}.`
  );

  return {
    decision: "require_approval",
    approvalId: approval.id
  };
}

export async function executeApprovedAgentArchive(
  agentId: string,
  approvalId: string
) {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  if (
    agent.status !== "draft" &&
    agent.status !== "active" &&
    agent.status !== "disabled"
  ) {
    throw new Error(
      `Agent cannot be archived from status: ${agent.status}.`
    );
  }

  const tool = getTool("agent.archive");

  if (!tool) {
    throw new Error(
      "agent.archive tool is not registered."
    );
  }

  await consumeApproval(
    approvalId,
    tool.name,
    { agentId }
  );

  return transitionAgentLifecycle(
    agentId,
    "archived"
  );
}