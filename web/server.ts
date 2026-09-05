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

const HOST = "127.0.0.1";
const PORT = 3000;

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
  model: "qwen3:1.7b"
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

  const result =
    await runtime.process({
      userMessage,
      source: "text",
      ownerAuthToken: UI_TOKEN,
      conversation
    });

  if (
    result.type === "approval_required"
  ) {

    sessions.set(
      result.approvalId,
      {
        userMessage,
        traceId: result.traceId,
        approvalId: result.approvalId
      }
    );
  }

  sendJson(response, 200, result);
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

    sendJson(response, 200, result);

  } finally {

    approvalsInFlight.delete(
      approvalId
    );
  }
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
            model: "qwen3:1.7b"
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

