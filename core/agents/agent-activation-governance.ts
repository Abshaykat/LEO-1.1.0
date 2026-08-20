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

export interface AgentActivationRequest {
  decision: "require_approval";
  approvalId: string;
}

export async function requestAgentActivation(
  agentId: string
): Promise<AgentActivationRequest> {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  if (agent.status !== "draft") {
    throw new Error(
      `Agent cannot be activated from status: ${agent.status}.`
    );
  }

  const tool = getTool("agent.activate");

  if (!tool) {
    throw new Error(
      "agent.activate tool is not registered."
    );
  }

  const approval = await createApprovalRequest(
    tool,
    { agentId },
    `Activate L.E.O. agent ${agentId}.`
  );

  return {
    decision: "require_approval",
    approvalId: approval.id
  };
}

export async function executeApprovedAgentActivation(
  agentId: string,
  approvalId: string
) {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  if (agent.status !== "draft") {
    throw new Error(
      `Agent cannot be activated from status: ${agent.status}.`
    );
  }

  const tool = getTool("agent.activate");

  if (!tool) {
    throw new Error(
      "agent.activate tool is not registered."
    );
  }

  await consumeApproval(
    approvalId,
    tool.name,
    { agentId }
  );

  return transitionAgentLifecycle(
    agentId,
    "active"
  );
}