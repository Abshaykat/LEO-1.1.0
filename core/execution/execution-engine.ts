import {
  mkdir,
  readdir,
  readFile,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";

import {
  getTool,
  type ToolDefinition
} from "../permissions/tool-registry.ts";
import {
  COMMAND_TIMEOUT_MS,
  COMMAND_WORKING_DIRECTORY,
  LEO_ROOT,
  MAX_COMMAND_OUTPUT_BYTES,
  MAX_FILE_READ_BYTES,
  MAX_FILE_WRITE_BYTES,
  WORKSPACE_ROOT,
  assertInside,
  resolveLeoPath
} from "../config/leo-config.ts";
import {
  executeThroughGate,
  type ExecutionContext,
  type ToolExecutor,
  type ExecutionDecision
} from "./execution-gate.ts";
import {
  openBrowser,
  searchBrowser,
  fetchPublicPage
} from "../tools/web-tools.ts";
import { gitStatus, gitDiff, gitCommit } from "../tools/git-tools.ts";
import { dockerControl } from "../tools/docker-tools.ts";
import { createAgent, deleteAgent, listAgents } from "../agents/agent-store.ts";
import { createEncryptedBackup, verifyEncryptedBackup } from "../backup/backup-manager.ts";
import { updatePolicy } from "../security/policy-store.ts";

export interface ExecutionRequest {
  toolName: string;
  parameters: unknown;
  reason: string;
  context: ExecutionContext;
  approvalId?: string;
  traceId?: string;
}

export type ExecutionResult = ExecutionDecision;

function objectParams(parameters: unknown): Record<string, unknown> {
  if (typeof parameters !== "object" || parameters === null || Array.isArray(parameters)) {
    throw new Error("Tool parameters must be an object.");
  }
  return parameters as Record<string, unknown>;
}

function normalizeExternalPath(value: string): string {
  const normalized = value.trim();
  const windowsRootPattern = /^[A-Za-z]:\\LEO(?:\\|$)/i;
  if (process.platform !== "win32" && windowsRootPattern.test(normalized)) {
    const relative = normalized.replace(/^[A-Za-z]:\\LEO\\?/i, "");
    return path.join(LEO_ROOT, relative.replace(/\\/g, path.sep));
  }
  return normalized;
}

function authorizedReadPath(value: unknown): string {
  const p = objectParams({ path: value }).path;
  if (typeof p !== "string") throw new Error("A valid file path is required.");
  const resolved = resolveLeoPath(normalizeExternalPath(p), LEO_ROOT);
  return resolved;
}

function authorizedWritePath(value: unknown): string {
  const p = objectParams({ path: value }).path;
  if (typeof p !== "string") throw new Error("A valid file path is required.");
  return assertInside(WORKSPACE_ROOT, path.isAbsolute(p) ? p : path.join(WORKSPACE_ROOT, p));
}

async function executeReadFile(parameters: unknown): Promise<unknown> {
  const p = objectParams(parameters);
  const filePath = authorizedReadPath(p.path);
  const data = await readFile(filePath);
  if (data.byteLength > MAX_FILE_READ_BYTES) throw new Error("File exceeds the configured read limit.");
  return { path: filePath, content: data.toString("utf8") };
}

async function executeWriteFile(parameters: unknown): Promise<unknown> {
  const p = objectParams(parameters);
  if (typeof p.path !== "string" || typeof p.content !== "string") {
    throw new Error("pc.write_file requires path and string content.");
  }
  if (Buffer.byteLength(p.content, "utf8") > MAX_FILE_WRITE_BYTES) {
    throw new Error("File content exceeds the configured write limit.");
  }
  const filePath = authorizedWritePath(normalizeExternalPath(p.path));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, p.content, "utf8");
  return {
    path: filePath,
    bytesWritten: Buffer.byteLength(p.content, "utf8")
  };
}

async function executeListDirectory(parameters: unknown): Promise<unknown> {
  const p = objectParams(parameters);
  const requested = typeof p.path === "string" ? p.path : ".";
  const dir = resolveLeoPath(requested, LEO_ROOT);
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.map(entry => ({
    name: entry.name,
    type: entry.isDirectory() ? "directory" : "file"
  }));
}

function validateCommand(command: unknown): string {
  if (typeof command !== "string" || !command.trim()) {
    throw new Error("pc.run_command requires a non-empty command.");
  }
  const normalized = command.trim();
  if (Buffer.byteLength(normalized, "utf8") > 16 * 1024) {
    throw new Error("Command exceeds the maximum allowed size.");
  }

  const blockedPatterns = [
    /[;&|]/,
    /(?:^|[\s])(?:>>|>)/,
    /(?:^|[\s])(?:rm|del|erase|rmdir|format)\b/i,
    /(?:^|[\s])(?:shutdown|restart-computer|stop-computer)\b/i,
    /(?:invoke-expression|iex)\b/i,
    /-encodedcommand\b/i,
    /-enc\b/i,
    /(?:start-process|start-job|start-threadjob)\b/i,
    /(?:invoke-webrequest|iwr|invoke-restmethod|irm)\b/i,
    /(?:set-executionpolicy|add-mppreference)\b/i,
    /(?:reg\s+(?:add|delete))\b/i,
    /(?:net\s+(?:user|localgroup|share|use))\b/i
  ];

  if (blockedPatterns.some(pattern => pattern.test(normalized))) {
    throw new Error("Command rejected by the L.E.O. command execution policy.");
  }
  return normalized;
}

async function executeRunCommand(parameters: unknown): Promise<unknown> {
  const p = objectParams(parameters);
  const command = validateCommand(p.command);
  const cwd =
    typeof p.workingDirectory === "string"
      ? assertInside(
          LEO_ROOT,
          path.resolve(normalizeExternalPath(p.workingDirectory))
        )
      : COMMAND_WORKING_DIRECTORY;

  const executable =
    process.platform === "win32"
      ? "powershell.exe"
      : (process.env.SHELL ?? "/bin/sh");

  const portableCommand =
    process.platform === "win32"
      ? command
      : command.replace(
          /^Write-Output\s+(.+)$/i,
          "printf '%s\\n' $1"
        );

  const args =
    process.platform === "win32"
      ? ["-NoProfile", "-NonInteractive", "-NoLogo", "-Command", portableCommand]
      : ["-lc", portableCommand];

  return new Promise((resolve, reject) => {
    execFile(
      executable,
      args,
      {
        cwd,
        windowsHide: true,
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: MAX_COMMAND_OUTPUT_BYTES
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr.trim() || error.message));
          return;
        }
        resolve({
          stdout,
          stderr,
          exitCode: 0
        });
      }
    );
  });
}

async function executePermissionChange(parameters: unknown): Promise<unknown> {
  const p = objectParams(parameters);
  const key = typeof p.key === "string" ? p.key : "";
  if (!["allowAgentCreation", "allowPermissionChanges", "allowExternalSystemActions"].includes(key)) {
    throw new Error("Unsupported permission policy key.");
  }
  if (typeof p.value !== "boolean") throw new Error("Permission policy value must be boolean.");
  return updatePolicy({ [key]: p.value });
}

const executor: ToolExecutor = async (tool: ToolDefinition, parameters: unknown) => {
  switch (tool.name) {
    case "pc.read_file": return executeReadFile(parameters);
    case "pc.write_file": return executeWriteFile(parameters);
    case "pc.list_directory": return executeListDirectory(parameters);
    case "pc.run_command": return executeRunCommand(parameters);
    case "browser.open": return openBrowser(objectParams(parameters).url);
    case "browser.search": return searchBrowser(objectParams(parameters).query);
    case "web.fetch": return fetchPublicPage(objectParams(parameters).url);
    case "git.status": return gitStatus(parameters);
    case "git.diff": return gitDiff(parameters);
    case "git.commit": return gitCommit(parameters);
    case "docker.control": return dockerControl(parameters);
    case "agent.list": return listAgents();
    case "agent.create": {
      const p = objectParams(parameters);
      return createAgent({
        name: String(p.name ?? ""),
        purpose: String(p.purpose ?? ""),
        instructions: String(p.instructions ?? "")
      });
    }
    case "agent.delete": {
      const p = objectParams(parameters);
      await deleteAgent(String(p.id ?? ""));
      return { deleted: true, id: String(p.id ?? "") };
    }
    case "permissions.modify": return executePermissionChange(parameters);
    case "backup.create": return createEncryptedBackup();
    case "backup.verify": return verifyEncryptedBackup(String(objectParams(parameters).path ?? ""));
    default:
      throw new Error(`No executor is registered for tool: ${tool.name}`);
  }
};

export async function execute(request: ExecutionRequest): Promise<ExecutionResult> {
  const tool = getTool(request.toolName);
  if (!tool) return { decision: "deny", reason: `Unknown tool: ${request.toolName}` };

  return executeThroughGate(
    {
      tool,
      parameters: request.parameters,
      reason: request.reason,
      context: request.context,
      approvalId: request.approvalId,
      traceId: request.traceId
    },
    executor
  );
}
