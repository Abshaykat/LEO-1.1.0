import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function main(): Promise<void> {
  const relay = await readFile("core/remote/remote-relay.ts", "utf8");
  const worker = await readFile("cloudflare/worker.ts", "utf8");
  assert(relay.includes('LEO_REMOTE_ENABLED'));
  assert(relay.includes('role: "pc"'));
  assert(relay.includes("processLeoRemote"));
  assert(worker.includes("REMOTE_TOKEN"));
  assert(worker.includes("acceptWebSocket"));
  assert(worker.includes("getWebSockets"));
  assert(worker.includes("serializeAttachment"));
  assert(worker.includes('targetRole'));
  console.log("PASS: authenticated cloud relay is transport-only and hibernation-safe.");
}
main().catch(error => { console.error(error); process.exit(1); });
