import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main(): Promise<void> {
  const html=await readFile(path.join(process.cwd(),"web","index.html"),"utf8");
  const manifest=await readFile(path.join(process.cwd(),"web","manifest.webmanifest"),"utf8");
  const docs=await readFile(path.join(process.cwd(),"MOBILE-ACCESS.md"),"utf8");
  assert(html.includes("SpeechRecognition"));
  assert(html.includes("bn-BD"));
  assert(html.includes('sendMessage("voice")'));
  assert(html.includes("/manifest.webmanifest"));
  assert(manifest.includes('"display":"standalone"'));
  assert(docs.includes("Tailscale"));
  assert(docs.includes("Do not port-forward"));
  console.log("PASS: mobile PWA shell, voice command path and private remote-access guidance.");
}
main().catch(error=>{console.error(error);process.exit(1);});
