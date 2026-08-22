import {
  createApprovalRequest,
  consumeApproval
} from "../approvals/approval-engine.ts";

import {
  getTool
} from "../permissions/tool-registry.ts";

import {
  getAgent,
  deleteAgent
} from "./agent-store.ts";

export interface AgentDeleteRequest {
  decision: "require_approval";
  approvalId: string;
}

export async function requestAgentDelete(
  agentId: string
): Promise<AgentDeleteRequest> {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  const tool = getTool("agent.delete");

  if (!tool) {
    throw new Error(
      "agent.delete tool is not registered."
    );
  }

  const approval = await createApprovalRequest(
    tool,
    { agentId },
    `Delete L.E.O. agent ${agentId}.`
  );

  return {
    decision: "require_approval",
    approvalId: approval.id
  };
}

export async function executeApprovedAgentDelete(
  agentId: string,
  approvalId: string
) {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  const tool = getTool("agent.delete");

  if (!tool) {
    throw new Error(
      "agent.delete tool is not registered."
    );
  }

  await consumeApproval(
    approvalId,
    tool.name,
    { agentId }
  );

  return deleteAgent(agentId);
}