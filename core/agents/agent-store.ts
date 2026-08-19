import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AGENT_ROOT } from "../config/leo-config.ts";

export interface LeoAgent {
  id: string;
  name: string;
  purpose: string;
  instructions: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

function filePath(id: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(id)) {
    throw new Error("Invalid agent id.");
  }
  return path.join(AGENT_ROOT, `${id}.json`);
}

async function ensure(): Promise<void> {
  await mkdir(AGENT_ROOT, { recursive: true });
}

async function save(agent: LeoAgent): Promise<void> {
  await ensure();
  const target = filePath(agent.id);
  const temp = `${target}.tmp`;
  await writeFile(temp, JSON.stringify(agent, null, 2) + "\n", "utf8");
  await rename(temp, target);
}

export async function listAgents(): Promise<LeoAgent[]> {
  await ensure();
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(AGENT_ROOT, { withFileTypes: true });
  const result: LeoAgent[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    try {
      const value = JSON.parse(await readFile(path.join(AGENT_ROOT, entry.name), "utf8")) as LeoAgent;
      if (value && typeof value.id === "string") result.push(value);
    } catch {
      // Ignore malformed agent files. Diagnostics can report them later.
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createAgent(input: Pick<LeoAgent, "name" | "purpose" | "instructions">): Promise<LeoAgent> {
  if (!input.name.trim() || !input.purpose.trim() || !input.instructions.trim()) {
    throw new Error("Agent name, purpose and instructions are required.");
  }
  const now = new Date().toISOString();
  const agent: LeoAgent = {
    id: randomUUID(),
    name: input.name.trim(),
    purpose: input.purpose.trim(),
    instructions: input.instructions.trim(),
    enabled: false,
    createdAt: now,
    updatedAt: now
  };
  await save(agent);
  return agent;
}

export async function deleteAgent(id: string): Promise<void> {
  try {
    await unlink(filePath(id));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
}
