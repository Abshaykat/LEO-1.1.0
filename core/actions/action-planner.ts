import type {
  ActionPlan,
  PlannedAction
} from "./action-plan.ts";

import type {
  LeoBrain
} from "../orchestrator/leo-brain.ts";

import type {
  AIMessage
} from "../ai/ai-provider.ts";

export class ActionPlanner {

  plan(
    input: string
  ): ActionPlan {

    const trimmed =
      input.trim();

    if (!trimmed) {
      return {
        type: "response",
        response:
          "I need a command or request to continue."
      };
    }

    const looksLikeNaturalLanguageWorkflow =
      /\b(workflow|prepared|plan|steps?|please execute|please run)\b/i.test(trimmed);

    const runCommandMatch =
      !looksLikeNaturalLanguageWorkflow
        ? trimmed.match(/^run\s+(.+)$/i)
        : null;

    if (runCommandMatch) {

      const command =
        runCommandMatch[1].trim();

      const action: PlannedAction = {
        toolName:
          "pc.run_command",

        parameters: {
          command,
          workingDirectory:
            "D:\\LEO"
        },

        reason:
          "Execute the command requested by the owner."
      };

      return {
        type: "action",
        action
      };
    }

    return {
      type: "response",
      response:
        `I understand the request, but I do not have a registered action for it yet: ${trimmed}`
    };
  }


  async planWithAI(
    input: string,
    brain: LeoBrain,
    conversation?: AIMessage[],
    memoryContext?: string
  ): Promise<ActionPlan> {

    const aiResult =
      await brain.planAction({
        userMessage:
          input,
        conversation,
        memoryContext
      });
    if (aiResult.actionPlan) {
      return aiResult.actionPlan;
    }

    return {
      type: "response",
      response:
        aiResult.response
    };
  }
}
