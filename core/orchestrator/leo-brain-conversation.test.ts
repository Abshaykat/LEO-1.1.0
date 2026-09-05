import type {
  AIProvider,
  AIRequest,
  AIResponse
} from "../ai/ai-provider.ts";

import {
  LeoBrain
} from "./leo-brain.ts";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `CONVERSATION BRAIN TEST FAILURE: ${message}`
    );
  }
}

class StubProvider implements AIProvider {
  readonly name =
    "conversation-brain-test";

  constructor(
    private readonly response: string
  ) {}

  async generate(
    _request: AIRequest
  ): Promise<AIResponse> {
    return {
      content:
        this.response,
      provider:
        this.name,
      model:
        "conversation-test-model"
    };
  }
}

async function main(): Promise<void> {
  console.log(
    "=== L.E.O. CONVERSATION BRAIN TEST ==="
  );

  const hallucinatedWorkflow =
    JSON.stringify({
      type:
        "workflow",
      workflow: {
        workflowId:
          "should-never-execute",
        reason:
          "Incorrectly generated for ordinary conversation.",
        steps: [
          {
            id:
              "step-1",
            action: {
              toolName:
                "pc.run_command",
              parameters: {
                command:
                  "Write-Output 'unexpected'"
              },
              reason:
                "Invalid conversational workflow."
            }
          }
        ]
      }
    });

  const brain =
    new LeoBrain(
      new StubProvider(
        hallucinatedWorkflow
      )
    );

  const result =
    await brain.respond({
      userMessage:
        "Hello L.E.O., how are you?"
    });

  assert(
    result.actionPlan === undefined,
    "Conversation response exposed an executable action plan."
  );

  assert(
    result.response.includes(
      "normal conversation"
    ),
    "Workflow-looking model output was not converted to a safe conversational response."
  );

  console.log(
    "PASS: Workflow-looking model output cannot become a conversational action plan."
  );

  const banglaBrain =
    new LeoBrain(
      new StubProvider(
        hallucinatedWorkflow
      )
    );

  const banglaResult =
    await banglaBrain.respond({
      userMessage:
        "লিও, কেমন আছো?"
    });

  assert(
    banglaResult.response.includes(
      "বুঝেছি"
    ),
    "Bangla conversation did not receive a Bangla fallback."
  );

  console.log(
    "PASS: Bangla conversation fallback is automatically selected."
  );

  const banglishBrain =
    new LeoBrain(
      new StubProvider(
        hallucinatedWorkflow
      )
    );

  const banglishResult =
    await banglishBrain.respond({
      userMessage:
        "Leo, kemon acho? Ami ke?"
    });

  assert(
    banglishResult.response.includes(
      "Bujhlam"
    ),
    "Banglish conversation did not receive a Banglish fallback."
  );

  console.log(
    "PASS: Banglish conversation fallback is automatically selected."
  );

  console.log(
    "=== L.E.O. CONVERSATION BRAIN TEST PASSED ==="
  );
}

main().catch(
  error => {
    console.error(
      "=== L.E.O. CONVERSATION BRAIN TEST FAILED ==="
    );
    console.error(error);
    process.exit(1);
  }
);
