export interface Env { RELAY: DurableObjectNamespace; REMOTE_TOKEN: string; }

type Role = "pc" | "mobile";
type Client = { ws: WebSocket; role: Role; authenticated: boolean };

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
  private clients = new Map<WebSocket, Client>();
  constructor(ctx: DurableObjectState, private readonly env: Env) { super(ctx, env); }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected WebSocket", { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    this.clients.set(server, { ws: server, role: "mobile", authenticated: false });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    let message: any;
    try { message = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw)); }
    catch { ws.close(1003, "Invalid JSON"); return; }
    const client = this.clients.get(ws);
    if (!client) return;
    if (!client.authenticated) {
      if (message?.type !== "auth" || message.token !== this.env.REMOTE_TOKEN) { ws.close(1008, "Authentication failed"); return; }
      client.role = message.role === "pc" ? "pc" : "mobile";
      client.authenticated = true;
      ws.send(JSON.stringify({ type: "authenticated", role: client.role }));
      this.broadcastStatus();
      return;
    }
    if (message?.type === "ping") { ws.send(JSON.stringify({ type: "pong" })); return; }
    const targetRole: Role = client.role === "mobile" ? "pc" : "mobile";
    for (const [other, state] of this.clients) {
      if (state.authenticated && state.role === targetRole && other.readyState === WebSocket.OPEN) other.send(JSON.stringify(message));
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> { this.clients.delete(ws); this.broadcastStatus(); }
  async webSocketError(ws: WebSocket): Promise<void> { this.clients.delete(ws); this.broadcastStatus(); }

  private broadcastStatus(): void {
    const pc = [...this.clients.values()].some(x => x.authenticated && x.role === "pc");
    const mobile = [...this.clients.values()].some(x => x.authenticated && x.role === "mobile");
    const payload = JSON.stringify({ type: "status", pcOnline: pc, mobileOnline: mobile });
    for (const state of this.clients.values()) if (state.authenticated && state.ws.readyState === WebSocket.OPEN) state.ws.send(payload);
  }
}
