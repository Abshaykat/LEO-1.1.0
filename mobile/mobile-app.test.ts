import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function main(): Promise<void> {
  const html = await readFile("mobile/index.html", "utf8");
  const manifest = await readFile("mobile/manifest.webmanifest", "utf8");
  const sw = await readFile("mobile/sw.js", "utf8");
  assert(html.includes('new WebSocket'));
  assert(html.includes('role:"mobile"'));
  assert(html.includes('type:"execute"'));
  assert(html.includes('type:"approve"'));
  assert(html.includes("SpeechRecognition"));
  assert(!html.includes('id="lang"'));
  assert(html.includes("detectVoiceLanguage"));
  assert(html.includes("preferredVoiceLanguage"));
  assert(manifest.includes('"display":"standalone"'));
  assert(sw.includes("caches"));
  console.log("PASS: installable mobile console, remote command/approval path and voice input.");
}
main().catch(error => { console.error(error); process.exit(1); });
