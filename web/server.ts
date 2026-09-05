import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash, randomBytes } from "node:crypto";

import { LeoBrain } from "../core/orchestrator/leo-brain.ts";
import { OllamaAIProvider } from "../core/ai/ollama-provider.ts";
import { LeoRuntime } from "../core/runtime/leo-runtime.ts";
import { OwnerAuthenticator } from "../core/identity/owner-auth.ts";
import {
  approveRequest,
  getApprovalRequest
} from "../core/approvals/approval-engine.ts";

const HOST = process.env.LEO_UI_HOST?.trim() || "127.0.0.1";
const PORT = Number(process.env.LEO_UI_PORT || "3000");

const MAX_BODY_BYTES = 64 * 1024;

class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const provider = new OllamaAIProvider({
  model: process.env.LEO_AI_MODEL?.trim() || "qwen3:4b",
  temperature: Number(process.env.LEO_AI_TEMPERATURE || "0.35"),
  maxTokens: Number(process.env.LEO_AI_MAX_TOKENS || "768"),
  think: false
});

const brain = new LeoBrain(provider);


const sessions = new Map<
  string,
  {
    userMessage: string;
    traceId: string;
    approvalId: string;
  }
>();

const approvalsInFlight = new Set<string>();

type ActivityJob = {
  jobId: string;
  title: string;
  status: "running" | "waiting_approval" | "completed" | "failed";
  progress: number | null;
  currentStep: string;
  startedAt: string;
  updatedAt: string;
  source: "local" | "remote";
  result?: string;
};

const activityJobs = new Map<string, ActivityJob>();

function updateActivity(
  jobId: string,
  patch: Partial<ActivityJob>
): void {
  const current = activityJobs.get(jobId);
  if (!current) return;
  activityJobs.set(jobId, {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  });
}

export function getLeoActivity(): ActivityJob[] {
  return [...activityJobs.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 50);
}

const UI_TOKEN =
  process.env.LEO_UI_TOKEN ??
  randomBytes(24).toString("hex");

const OWNER_ID =
  process.env.LEO_OWNER_ID?.trim();

if (!OWNER_ID) {
  throw new Error(
    "LEO_OWNER_ID must be configured before starting the L.E.O. local UI."
  );
}

const ownerAuthenticator =
  new OwnerAuthenticator({
    ownerId:
      OWNER_ID,
    tokenSha256:
      createHash("sha256")
        .update(
          UI_TOKEN,
          "utf8"
        )
        .digest("hex")
  });

const runtime =
  new LeoRuntime(
    brain,
    ownerAuthenticator
  );

console.log("");
console.log("=== L.E.O. LOCAL UI ===");
console.log(`http://${HOST}:${PORT}`);
console.log("");
console.log("L.E.O. UI token loaded from private configuration.");
console.log("Use Show-LEO-Token.ps1 to retrieve it when needed.");
console.log("Keep this terminal open while using L.E.O.");
console.log("");

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  data: unknown
): void {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  response.end(JSON.stringify(data));
}

async function readBody(
  request: import("node:http").IncomingMessage
): Promise<Record<string, unknown>> {

  const contentLengthHeader =
    request.headers["content-length"];

  if (contentLengthHeader) {

    const contentLength =
      Number(contentLengthHeader);

    if (
      !Number.isFinite(contentLength) ||
      contentLength < 0
    ) {
      throw new HttpError(
        400,
        "Invalid Content-Length."
      );
    }

    if (contentLength > MAX_BODY_BYTES) {
      throw new HttpError(
        413,
        "Request body too large."
      );
    }
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {

    const buffer =
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk);

    totalBytes += buffer.length;

    if (totalBytes > MAX_BODY_BYTES) {
      throw new HttpError(
        413,
        "Request body too large."
      );
    }

    chunks.push(buffer);
  }

  const raw =
    Buffer.concat(chunks).toString("utf8");

  if (!raw) {
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError(
      400,
      "Invalid JSON body."
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new HttpError(
      400,
      "JSON body must be an object."
    );
  }

  return parsed as Record<string, unknown>;
}

function requiresJson(
  request: import("node:http").IncomingMessage
): boolean {

  const contentType =
    request.headers["content-type"];

  return (
    typeof contentType === "string" &&
    contentType
      .toLowerCase()
      .split(";")[0]
      .trim() === "application/json"
  );
}

function authorized(
  request: import("node:http").IncomingMessage
): boolean {

  const token =
    request.headers["x-leo-token"];

  return (
    typeof token === "string" &&
    token === UI_TOKEN
  );
}

async function handleChat(
  request: import("node:http").IncomingMessage,
  response: import("node:http").ServerResponse
): Promise<void> {

  if (!requiresJson(request)) {
    sendJson(response, 415, {
      error: "Content-Type must be application/json."
    });
    return;
  }

  const body =
    await readBody(request);

  const userMessage =
    typeof body.userMessage === "string"
      ? body.userMessage.trim()
      : "";

  if (!userMessage) {
    sendJson(response, 400, {
      error: "Message is required."
    });
    return;
  }

  const conversation =
    Array.isArray(body.conversation)
      ? body.conversation
      : undefined;

  const jobId = randomBytes(12).toString("hex");
  activityJobs.set(jobId, {
    jobId,
    title: userMessage.slice(0, 120),
    status: "running",
    progress: 10,
    currentStep: "Request accepted and governance checks started",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "local"
  });

  updateActivity(jobId, {
    progress: 35,
    currentStep: "Planning and capability selection"
  });

  const result =
    await runtime.process({
      userMessage,
      source: body.source === "voice" ? "voice" : "text",
      ownerAuthToken: UI_TOKEN,
      conversation
    });

  if (result.type === "approval_required") {
    updateActivity(jobId, {
      status: "waiting_approval",
      progress: 50,
      currentStep: "Waiting for owner approval"
    });

    sessions.set(
      result.approvalId,
      {
        userMessage,
        traceId: result.traceId,
        approvalId: result.approvalId
      }
    );
  }

  if (result.type !== "approval_required") {
    updateActivity(jobId, {
      status: result.type === "denied" ? "failed" : "completed",
      progress: result.type === "denied" ? 100 : 100,
      currentStep: result.type === "denied" ? "Execution denied by governance" : "Execution and verification completed",
      result: result.response
    });
  }

  sendJson(response, 200, { ...result, jobId });
}

async function handleApprove(
  request: import("node:http").IncomingMessage,
  response: import("node:http").ServerResponse
): Promise<void> {

  if (!requiresJson(request)) {
    sendJson(response, 415, {
      error: "Content-Type must be application/json."
    });
    return;
  }

  const body =
    await readBody(request);

  const approvalId =
    typeof body.approvalId === "string"
      ? body.approvalId
      : "";

  if (!approvalId) {
    sendJson(response, 400, {
      error: "approvalId is required."
    });
    return;
  }

  if (approvalsInFlight.has(approvalId)) {
    sendJson(response, 409, {
      error:
        "Approval execution is already in progress."
    });
    return;
  }

  const session =
    sessions.get(approvalId);

  if (!session) {
    sendJson(response, 404, {
      error:
        "Approval session not found or already completed."
    });
    return;
  }

  approvalsInFlight.add(approvalId);

  try {

    const approval =
      await getApprovalRequest(
        approvalId
      );

    if (!approval) {
      sendJson(response, 404, {
        error: "Approval request not found."
      });
      return;
    }

    await approveRequest(
      approvalId,
      session.traceId
    );

    const jobId = randomBytes(12).toString("hex");
    activityJobs.set(jobId, {
      jobId,
      title: session.userMessage.slice(0, 120),
      status: "running",
      progress: 65,
      currentStep: "Owner approval consumed; executing approved action",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "local"
    });

    const result =
      await runtime.process({
        userMessage:
          session.userMessage,

        source:
          "text",

        ownerAuthToken:
          UI_TOKEN,

        approvalId:
          session.approvalId,

        traceId:
          session.traceId
      });

    sessions.delete(
      approvalId
    );

    updateActivity(jobId, {
      status: result.type === "denied" ? "failed" : "completed",
      progress: 100,
      currentStep: result.type === "denied" ? "Approved action was denied by execution policy" : "Execution and verification completed",
      result: result.response
    });

    sendJson(response, 200, { ...result, jobId });

  } finally {

    approvalsInFlight.delete(
      approvalId
    );
  }
}
export type RemoteLeoRequest = { userMessage: string; source?: "text" | "voice"; ownerId?: string; approvalId?: string; traceId?: string; conversation?: Parameters<LeoBrain["respond"]>[0]["conversation"] };

export async function processLeoRemote(request: RemoteLeoRequest) {
  return runtime.process({ ...request, ownerAuthToken: UI_TOKEN });
}

export function createLeoServer() {
  return createServer(
    async (request, response) => {

      try {

        if (
          request.url === "/" &&
          request.method === "GET"
        ) {

          const html =
            await readFile(
              join(
                process.cwd(),
                "web",
                "index.html"
              ),
              "utf8"
            );

          response.writeHead(200, {
            "Content-Type":
              "text/html; charset=utf-8"
          });

          response.end(html);
          return;
        }

        if (
          request.url === "/api/health" &&
          request.method === "GET"
        ) {

          sendJson(response, 200, {
            ok: true,
            service: "leo-local-ui",
            provider: provider.name,
            model: process.env.LEO_AI_MODEL?.trim() || "qwen3:4b"
          });

          return;
        }

        if (!authorized(request)) {
          sendJson(response, 401, {
            error: "Unauthorized."
          });
          return;
        }

        if (
          request.url === "/api/activity" &&
          request.method === "GET"
        ) {
          sendJson(response, 200, { jobs: getLeoActivity() });
          return;
        }

        if (
          request.url === "/api/chat" &&
          request.method === "POST"
        ) {

          await handleChat(
            request,
            response
          );

          return;
        }

        if (
          request.url === "/api/approve" &&
          request.method === "POST"
        ) {

          await handleApprove(
            request,
            response
          );

          return;
        }

        sendJson(response, 404, {
          error: "Not found."
        });

      } catch (error) {

        console.error(error);

        const status =
          error instanceof HttpError
            ? error.statusCode
            : 500;

        sendJson(response, status, {
          error:
            error instanceof Error
              ? error.message
              : String(error)
        });
      }
    }
  );
}

