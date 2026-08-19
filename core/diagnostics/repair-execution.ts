import type {
  DiagnosticReport
} from "./diagnostic-types.ts";

import type {
  RepairPlan
} from "./repair-types.ts";

import {
  execute,
  type ExecutionResult
} from "../execution/execution-engine.ts";

import type {
  ExecutionContext
} from "../execution/execution-gate.ts";

export interface RepairExecutionRequest {
  plan: RepairPlan;
  diagnosticReport: DiagnosticReport;
  toolName: string;
  parameters: unknown;
  reason: string;
  context: ExecutionContext;
  approvalId?: string;
  traceId?: string;
}

export async function executeRepair(
  request: RepairExecutionRequest
): Promise<ExecutionResult> {

  const {
    plan,
    diagnosticReport,
    toolName,
    parameters,
    reason,
    context,
    approvalId,
    traceId
  } = request;

  if (plan.status !== "repair_available") {
    throw new Error(
      "Repair plan is not executable."
    );
  }

  if (!plan.requiresApproval) {
    throw new Error(
      "Repair execution requires explicit owner approval."
    );
  }

  if (diagnosticReport.status === "healthy") {
    throw new Error(
      "Healthy diagnostics cannot produce an executable repair."
    );
  }

  if (diagnosticReport.confidence <= 0) {
    throw new Error(
      "Repair execution requires diagnostic evidence."
    );
  }

  return execute({
    toolName,
    parameters,
    reason:
      `[RepairPlan:${plan.id}] ${reason}`,
    context,
    approvalId,
    traceId
  });
}

