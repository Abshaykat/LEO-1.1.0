import type { AgentFactoryInput } from "./agent-policy.ts";
import { AgentFactory } from "./agent-factory.ts";

export type WorkforceRole = "research" | "browser" | "coding" | "system" | "office" | "data" | "ecommerce" | "marketing" | "trading";

export interface WorkforceAgent {
  role: WorkforceRole;
  definition: ReturnType<AgentFactory["createDraft"]>;
}

const ROLE_PURPOSES: Record<WorkforceRole, string> = {
  research: "Research and evidence gathering",
  browser: "Controlled browser and web research",
  coding: "Owner-approved coding assistance",
  system: "Controlled PC and system operations",
  office: "Controlled office/document automation",
  data: "Data processing and reporting",
  ecommerce: "E-commerce research and workflow assistance",
  marketing: "Marketing research and campaign preparation",
  trading: "Market research and risk-aware decision support"
};

export class AgentWorkforce {
  constructor(private readonly factory = new AgentFactory()) {}

  createRole(role: WorkforceRole, instructions: string, capabilities: string[] = []): WorkforceAgent {
    const purpose = ROLE_PURPOSES[role];
    const definition = this.factory.createDraft({
      name: `leo-${role}`,
      purpose,
      instructions,
      capabilities,
      permissions: []
    });
    return { role, definition };
  }

  canDelegateSensitiveAuthority(): false {
    return false;
  }
}
