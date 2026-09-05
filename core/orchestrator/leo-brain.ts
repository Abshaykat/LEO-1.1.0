import type {
  AIMessage,
  AIProvider
} from "../ai/ai-provider.ts";

import { listAiTools } from "../permissions/tool-registry.ts";

import {
  buildMarkStyleSystemPrompt,
  normalizeAssistantResponse
} from "../communication/mark-communication.ts";

import type {
  ActionPlan,
  WorkflowStep
} from "../actions/action-plan.ts";

export interface LeoBrainRequest {
  userMessage: string;
  conversation?: AIMessage[];
  memoryContext?: string;
}

export interface LeoBrainResponse {
  response: string;
  provider: string;
  model: string;
  actionPlan?: ActionPlan;
}

function extractJsonObject(
  text: string
): unknown | undefined {

  const fenced =
    text.match(
      /```(?:json)?\s*([\s\S]*?)\s*```/i
    );

  const candidate =
    fenced?.[1] ??
    text.match(/\{[\s\S]*\}/)?.[0];

  if (!candidate) {
    return undefined;
  }

  try {
    return JSON.parse(candidate);
  } catch {
    return undefined;
  }
}

function parseActionPlan(
  text: string
): ActionPlan | undefined {

  const parsed =
    extractJsonObject(text);

  if (
    typeof parsed !== "object" ||
    parsed === null
  ) {
    return undefined;
  }

  const value =
    parsed as Record<string, unknown>;

  /*
   * Local models may wrap structured JSON inside a
   * response string. Normalize exactly one such wrapper.
   */
  if (
    value.type === "workflow"
  ) {
    const rawWorkflow =
      value.workflow;

    if (
      typeof rawWorkflow !== "object" ||
      rawWorkflow === null
    ) {
      return undefined;
    }

    const workflow =
      rawWorkflow as Record<string, unknown>;

    if (
      typeof workflow.workflowId !== "string" ||
      workflow.workflowId.trim().length === 0 ||
      typeof workflow.reason !== "string" ||
      workflow.reason.trim().length === 0 ||
      !Array.isArray(workflow.steps) ||
      workflow.steps.length === 0
    ) {
      return undefined;
    }

    const steps: WorkflowStep[] = [];

    for (
      const rawStep of workflow.steps
    ) {
      if (
        typeof rawStep !== "object" ||
        rawStep === null
      ) {
        return undefined;
      }

      const step =
        rawStep as Record<string, unknown>;

      if (
        typeof step.id !== "string" ||
        step.id.trim().length === 0 ||
        typeof step.action !== "object" ||
        step.action === null
      ) {
        return undefined;
      }

      const rawAction =
        step.action as Record<string, unknown>;

      if (
        typeof rawAction.toolName !== "string" ||
        !("parameters" in rawAction) ||
        typeof rawAction.reason !== "string" ||
        rawAction.reason.trim().length === 0
      ) {
        return undefined;
      }

      steps.push({
        id:
          step.id,
        action: {
          toolName:
            rawAction.toolName,
          parameters:
            rawAction.parameters,
          reason:
            rawAction.reason
        }
      });
    }

    return {
      type:
        "workflow",
      workflow: {
        workflowId:
          workflow.workflowId,
        steps,
        reason:
          workflow.reason
      }
    };
  }
  if (
    value.type === "response" &&
    typeof value.response === "string"
  ) {

    const embedded =
      extractJsonObject(value.response);

    if (
      typeof embedded === "object" &&
      embedded !== null
    ) {

      const embeddedValue =
        embedded as Record<string, unknown>;
      if (
        embeddedValue.type === "workflow"
      ) {

        const embeddedWorkflowPlan =
          parseActionPlan(
            JSON.stringify(
              embeddedValue
            )
          );

        if (
          embeddedWorkflowPlan?.type ===
          "workflow"
        ) {
          return embeddedWorkflowPlan;
        }
      }


      if (
        embeddedValue.type === "action"
      ) {

        const embeddedAction =
          embeddedValue.action;

        if (
          typeof embeddedAction === "object" &&
          embeddedAction !== null
        ) {

          const action =
            embeddedAction as Record<string, unknown>;

          const reason =
            typeof action.reason === "string"
              ? action.reason
              : typeof embeddedValue.reason === "string"
                ? embeddedValue.reason
                : "AI-generated action requested by the owner.";

          if (
            typeof action.toolName === "string" &&
            "parameters" in action &&
            typeof reason === "string"
          ) {
            return {
              type: "action",
              action: {
                toolName:
                  action.toolName,

                parameters:
                  action.parameters,

                reason
              }
            };
          }
        }
      }
    }

    return {
      type: "response",
      response:
        value.response
    };
  }

  if (
    value.type !== "action" ||
    typeof value.action !== "object" ||
    value.action === null
  ) {
    return undefined;
  }

  const action =
    value.action as Record<string, unknown>;

  /*
   * Local models have produced both:
   *
   *   action.reason
   *
   * and:
   *
   *   top-level reason
   *
   * Normalize both forms into the internal action.reason
   * field. Security-sensitive validation remains in Runtime.
   */
  const reason =
    typeof action.reason === "string"
      ? action.reason
      : typeof value.reason === "string"
        ? value.reason
        : undefined;

  /*
   * Brain-level validation only checks that the AI
   * produced a structurally recognizable action.
   *
   * Security-sensitive validation belongs to Runtime.
   */
  if (
    typeof action.toolName !== "string" ||
    !("parameters" in action) ||
    typeof reason !== "string"
  ) {
    return undefined;
  }

  return {
    type:
      "action",

    action: {
      toolName:
        action.toolName,

      parameters:
        action.parameters,

      reason
    }
  };
}
export class LeoBrain {

  constructor(
    private readonly provider: AIProvider
  ) {}

  async respond(
    request: LeoBrainRequest
  ): Promise<LeoBrainResponse> {

    const messages: AIMessage[] = [
      {
        role: "system",
        content:
          buildMarkStyleSystemPrompt({
            userMessage: request.userMessage,
            conversationSize: request.conversation?.length ?? 0
          })
      },
      ...(request.memoryContext
        ? [{
            role: "system" as const,
            content:
              "Relevant owner memory retrieved by L.E.O. for this request:\n" +
              request.memoryContext
          }]
        : []),
      ...(request.conversation ?? []),
      {
        role: "user",
        content:
          request.userMessage
      }
    ];

    const result =
      await this.provider.generate({
        messages
      });

    return {
      response:
        normalizeAssistantResponse(result.content),

      provider:
        result.provider,

      model:
        result.model,

      actionPlan:
        parseActionPlan(
          result.content
        )
    };
  }

  async planAction(
    request: LeoBrainRequest
  ): Promise<LeoBrainResponse> {

    const messages: AIMessage[] = [
      {
        role: "system",
        content:
          "You are L.E.O.'s structured action planning engine and part of the same L.E.O. brain. " +
          "Understand Bangla, English, and Bangla-English mixed language and use supplied conversation context when interpreting the owner's request. " +
          "Preserve the owner's intended command exactly when it is clear. " +
          "You prepare structured actions but never execute them. " +
          "The currently enabled AI tools are: " +
          listAiTools().map(tool => tool.name).join(", ") +
          ". Only use one of these registered tools when the owner's request clearly requires an executable action. " +
          "For pc.run_command, return ONLY valid JSON in this exact structure: " +
          '{"type":"action","action":{"toolName":"pc.run_command","parameters":{"command":"<command>","workingDirectory":"D:\\\\LEO"},"reason":"<reason>"}}. ' +
          "For pc.read_file, return ONLY valid JSON in this exact structure: " +
          '{"type":"action","action":{"toolName":"pc.read_file","parameters":{"path":"<path>"},"reason":"<reason>"}}. ' +
          "For pc.write_file, return ONLY valid JSON in this exact structure: " +
          '{"type":"action","action":{"toolName":"pc.write_file","parameters":{"path":"<path>","content":"<content>"},"reason":"<reason>"}}. ' +

          "For multi-step requests that clearly require multiple executable steps, return ONLY valid JSON in this exact workflow structure: " +
          '{"type":"workflow","workflow":{"workflowId":"<unique-id>","steps":[{"id":"step-1","action":{"toolName":"<registered-tool>","parameters":{},"reason":"<reason>"}},{"id":"step-2","action":{"toolName":"<registered-tool>","parameters":{},"reason":"<reason>"}}],"reason":"<workflow reason>"}}. ' +
          "Each workflow step must contain an id and exactly one structured action. " +
          "Use only the registered AI tools. Never invent workflow tools. " +
          "Do not execute workflow steps. Runtime and the owner approval system control execution. " +

          "If the request is not an executable action, return ONLY valid JSON in this exact structure: " +
          '{"type":"response","response":"<response>"}. ' +
          "Do not invent tools. Do not execute anything. Do not include markdown."
      },
      ...(request.memoryContext
        ? [{
            role: "system" as const,
            content:
              "Relevant owner memory retrieved by L.E.O. for this request:\n" +
              request.memoryContext
          }]
        : []),
      ...(request.conversation ?? []),
      {
        role: "user",
        content:
          request.userMessage
      }
    ];

    const result =
      await this.provider.generate({
        messages
      });

    return {
      response:
        normalizeAssistantResponse(result.content),

      provider:
        result.provider,

      model:
        result.model,

      actionPlan:
        parseActionPlan(
          result.content
        )
    };
  }
}
