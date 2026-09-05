import { processLeoRemote, type RemoteLeoRequest } from "../../web/server.ts";

const ENABLED = process.env.LEO_REMOTE_ENABLED?.trim().toLowerCase() === "true";
const WS_URL = process.env.LEO_REMOTE_WS_URL?.trim();
const DEVICE_ID = process.env.LEO_REMOTE_DEVICE_ID?.trim();
const TOKEN = process.env.LEO_REMOTE_TOKEN?.trim();

let socket: WebSocket | undefined;
let stopping = false;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

function configured(): boolean { return Boolean(WS_URL && DEVICE_ID && TOKEN); }
function send(payload: unknown): void { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload)); }
function scheduleReconnect(): void {
  if (stopping || !configured() || reconnectTimer) return;
  reconnectTimer = setTimeout(() => { reconnectTimer = undefined; connect(); }, 5000);
}

async function handle(message: any): Promise<void> {
  if (message?.type !== "execute" && message?.type !== "approve") return;
  const request = message.payload as RemoteLeoRequest;
  try {
    const result = await processLeoRemote(request);
    send({ type: "result", requestId: message.requestId, payload: result });
  } catch (error) {
    send({ type: "result", requestId: message.requestId, payload: { type: "denied", response: error instanceof Error ? error.message : String(error), toolName: "remote" } });
  }
}

function connect(): void {
  if (!configured() || stopping) return;
  try {
    const url = new URL(WS_URL!);
    url.searchParams.set("device", DEVICE_ID!);
    socket = new WebSocket(url);
    socket.addEventListener("open", () => send({ type: "auth", role: "pc", token: TOKEN }));
    socket.addEventListener("message", event => { try { void handle(JSON.parse(String(event.data))); } catch {} });
    socket.addEventListener("close", () => { socket = undefined; scheduleReconnect(); });
    socket.addEventListener("error", () => { try { socket?.close(); } catch {} });
  } catch { scheduleReconnect(); }
}

export function startRemoteRelay(): { enabled: boolean; stop: () => void } {
  if (!ENABLED || !configured()) return { enabled: false, stop: () => {} };
  stopping = false;
  connect();
  return { enabled: true, stop: () => { stopping = true; if (reconnectTimer) clearTimeout(reconnectTimer); reconnectTimer = undefined; try { socket?.close(); } catch {} socket = undefined; } };
}
