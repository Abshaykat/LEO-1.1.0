export interface Env { RELAY: DurableObjectNamespace; REMOTE_TOKEN: string; }
type Role = "pc" | "mobile";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return Response.json({ ok: true, service: "leo-cloud-relay", transport: "websocket" });
    if (url.pathname !== "/ws" || request.headers.get("Upgrade") !== "websocket") return new Response("L.E.O. Cloud Relay", { status: 200 });
    const deviceId = url.searchParams.get("device");
    if (!deviceId || !/^[A-Za-z0-9._-]{8,100}$/.test(deviceId)) return new Response("Invalid device id.", { status: 400 });
    return env.RELAY.get(env.RELAY.idFromName(deviceId)).fetch(request);
  }
};

export class LeoRelay extends DurableObject {
  constructor(ctx: DurableObjectState, private readonly env: Env) { super(ctx, env); }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected WebSocket", { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ role: null, authenticated: false });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    let message: any;
    try { message = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw)); }
    catch { ws.close(1003, "Invalid JSON"); return; }

    const attachment = (ws.deserializeAttachment() || { role: null, authenticated: false }) as { role: Role | null; authenticated: boolean };

    if (!attachment.authenticated) {
      if (message?.type !== "auth" || message.token !== this.env.REMOTE_TOKEN) { ws.close(1008, "Authentication failed"); return; }
      const role: Role = message.role === "pc" ? "pc" : "mobile";
      ws.serializeAttachment({ role, authenticated: true });
      ws.send(JSON.stringify({ type: "authenticated", role }));
      this.broadcastStatus();
      return;
    }

    if (message?.type === "ping") { ws.send(JSON.stringify({ type: "pong" })); return; }

    const targetRole: Role = attachment.role === "mobile" ? "pc" : "mobile";
    for (const other of this.ctx.getWebSockets()) {
      const state = (other.deserializeAttachment() || {}) as { role?: Role; authenticated?: boolean };
      if (state.authenticated && state.role === targetRole && other.readyState === WebSocket.OPEN) other.send(JSON.stringify(message));
    }
  }

  async webSocketClose(): Promise<void> { this.broadcastStatus(); }
  async webSocketError(): Promise<void> { this.broadcastStatus(); }

  private broadcastStatus(): void {
    const sockets = this.ctx.getWebSockets();
    const pc = sockets.some(ws => { const a = (ws.deserializeAttachment() || {}) as any; return a.authenticated && a.role === "pc"; });
    const mobile = sockets.some(ws => { const a = (ws.deserializeAttachment() || {}) as any; return a.authenticated && a.role === "mobile"; });
    const payload = JSON.stringify({ type: "status", pcOnline: pc, mobileOnline: mobile });
    for (const ws of sockets) if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}
