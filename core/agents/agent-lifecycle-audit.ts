import {
  createTraceId,
  recordDecisionTrace
} from "../audit/decision-trace.ts";

export interface AgentLifecycleTraceContext {
  traceId: string;
  tool: string;
  agentId: string;
  approvalId: string;
}

export function createAgentLifecycleTraceId(): string {
  return createTraceId();
}

export async function recordAgentLifecycleApprovalRequested(
  context: AgentLifecycleTraceContext
): Promise<void> {
  await recordDecisionTrace({
    traceId: context.traceId,
    stage: "approval_requested",
    outcome: "require_approval",
    tool: context.tool,
    approvalId: context.approvalId,
    details: {
      lifecycle: true,
      agentId: context.agentId,
      operation: context.tool
    }
  });
}

export async function recordAgentLifecycleExecution(
  context: AgentLifecycleTraceContext
): Promise<void> {
  await recordDecisionTrace({
    traceId: context.traceId,
    stage: "execution_finished",
    outcome: "success",
    tool: context.tool,
    approvalId: context.approvalId,
    details: {
      lifecycle: true,
      agentId: context.agentId,
      operation: context.tool
    }
  });
}

export async function recordAgentLifecycleVerification(
  context: AgentLifecycleTraceContext
): Promise<void> {
  await recordDecisionTrace({
    traceId: context.traceId,
    stage: "verification",
    outcome: "success",
    tool: context.tool,
    approvalId: context.approvalId,
    details: {
      lifecycle: true,
      agentId: context.agentId,
      operation: context.tool,
      verified: true
    }
  });
}