import { AgentWorkforce } from "./agent-workforce.ts";

const workforce = new AgentWorkforce();
const agent = workforce.createRole("research", "Research only; never execute consequential actions.");
if (agent.definition.status !== "draft") throw new Error("Workforce agent must start as draft.");
if (agent.definition.securityPolicy.allowAutonomousExecution) throw new Error("Autonomous execution must remain disabled.");
if (workforce.canDelegateSensitiveAuthority()) throw new Error("Sensitive authority must never be delegated.");
console.log("PASS: Controlled AI Workforce governance.");
