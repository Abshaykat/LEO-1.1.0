import {
  createApprovalRequest,
  consumeApproval
} from "../approvals/approval-engine.ts";

import {
  getTool
} from "../permissions/tool-registry.ts";

import {
  getAgent,
  updateAgent,
  type UpdateAgentFields
} from "./agent-store.ts";

import {
  createAgentLifecycleTraceId,
  recordAgentLifecycleApprovalRequested,
  recordAgentLifecycleExecution,
  recordAgentLifecycleVerification
} from "./agent-lifecycle-audit.ts";

export type AgentUpdateFields = UpdateAgentFields;

export interface AgentUpdateRequest {
  decision: "require_approval";
  approvalId: string;
}

function validateUpdateFields(
  fields: AgentUpdateFields
): void {
  const keys = Object.keys(fields);

  if (keys.length === 0) {
    throw new Error(
      "Agent update requires at least one mutable field."
    );
  }

  const allowed = new Set([
    "name",
    "purpose",
    "instructions"
  ]);

  for (const key of keys) {
    if (!allowed.has(key)) {
      throw new Error(
        `Agent update field is not permitted: ${key}`
      );
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    if (
      typeof value !== "string" ||
      value.trim().length === 0
    ) {
      throw new Error(
        `Agent update field must be a non-empty string: ${key}`
      );
    }
  }
}

export async function requestAgentUpdate(
  agentId: string,
  fields: AgentUpdateFields
): Promise<AgentUpdateRequest> {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(
      `Agent not found: ${agentId}`
    );
  }

  if (agent.status === "archived") {
    throw new Error(
      "Archived agents cannot be updated."
    );
  }

  validateUpdateFields(fields);

  const tool = getTool("agent.update");

  if (!tool) {
    throw new Error(
      "agent.update tool is not registered."
    );
  }

  const approvedParameters = {
    agentId,
    fields
  };

  const traceId =
    createAgentLifecycleTraceId();

  const approval = await createApprovalRequest(
    tool,
    approvedParameters,
    `Update L.E.O. agent ${agentId}.`,
    traceId
  );

  await recordAgentLifecycleApprovalRequested({
    traceId,
    tool: tool.name,
    agentId,
    approvalId: approval.id
  });

  return {
    decision: "require_approval",
    approvalId: approval.id
  };
}

export async function executeApprovedAgentUpdate(
  agentId: string,
  approvalId: string
) {
  const agent = await getAgent(agentId);

  if (!agent) {
    throw new Error(
      `Agent not found: ${agentId}`
    );
  }

  if (agent.status === "archived") {
    throw new Error(
      "Archived agents cannot be updated."
    );
  }

  const tool = getTool("agent.update");

  if (!tool) {
    throw new Error(
      "agent.update tool is not registered."
    );
  }

  const approvedParameters =
    await getApprovedUpdateParameters(
      approvalId
    );

  const traceId =
    await getAgentLifecycleTraceId(
      approvalId
    );

  const approval = await consumeApproval(
    approvalId,
    tool.name,
    approvedParameters,
    traceId
  );

  const parameters = approval.parameters as {
    agentId?: unknown;
    fields?: unknown;
  };

  if (parameters.agentId !== agentId) {
    throw new Error(
      "Approved agent does not match requested agent."
    );
  }

  const fields = parameters.fields as
    | AgentUpdateFields
    | undefined;

  if (!fields) {
    throw new Error(
      "Approved update fields are missing."
    );
  }

  validateUpdateFields(fields);

  const updated =
    await updateAgent(
      agentId,
      fields
    );

  await recordAgentLifecycleExecution({
    traceId,
    tool: tool.name,
    agentId,
    approvalId
  });

  const verified =
    await getAgent(agentId);

  if (!verified) {
    await recordAgentLifecycleVerification({
      traceId,
      tool: tool.name,
      agentId,
      approvalId
    });

    throw new Error(
      "Updated agent could not be verified."
    );
  }

  for (const [key, value] of Object.entries(fields)) {
    if (
      verified[key as keyof AgentUpdateFields] !== value
    ) {
      await recordAgentLifecycleVerification({
        traceId,
        tool: tool.name,
        agentId,
        approvalId
      });

      throw new Error(
        `Updated field verification failed: ${key}.`
      );
    }
  }

  await recordAgentLifecycleVerification({
    traceId,
    tool: tool.name,
    agentId,
    approvalId
  });

  return updated;
}

async function getAgentLifecycleTraceId(
  approvalId: string
): Promise<string> {
  const {
    getAuditFilePath
  } = await import(
    "../audit/audit-logger.ts"
  );

  const {
    readFile
  } = await import(
    "node:fs/promises"
  );

  const content =
    await readFile(
      getAuditFilePath(),
      "utf8"
    );

  const events = content
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map(
      line =>
        JSON.parse(line) as {
          type?: string;
          approvalId?: string;
          traceId?: string;
        }
    );

  const event = events
    .reverse()
    .find(
      item =>
        item.approvalId === approvalId &&
        item.traceId
    );

  if (!event?.traceId) {
    throw new Error(
      "Lifecycle trace ID could not be recovered."
    );
  }

  return event.traceId;
}

async function getApprovedUpdateParameters(
  approvalId: string
): Promise<unknown> {
  const { getApprovalRequest } =
    await import("../approvals/approval-engine.ts");

  const approval =
    await getApprovalRequest(approvalId);

  if (!approval) {
    throw new Error(
      "Approval request not found."
    );
  }

  if (approval.tool !== "agent.update") {
    throw new Error(
      "Approval does not belong to agent.update."
    );
  }

  return approval.parameters;
}