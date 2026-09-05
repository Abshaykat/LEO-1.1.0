import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function main(): Promise<void> {
  const launcher = await readFile("Launch-LEO-App.ps1", "utf8");
  const cmd = await readFile("Launch-LEO-App.cmd", "utf8");
  const setup = await readFile("Setup-LEO.ps1", "utf8");
  assert(cmd.includes("WindowsPowerShell"));
  assert(launcher.includes("msedge.exe"));
  assert(launcher.includes("--app=http://127.0.0.1:3000"));
  assert(setup.includes("LEO_REMOTE_ENABLED=false"));
  console.log("PASS: Windows app-style launcher and remote configuration.");
}
main().catch(error => { console.error(error); process.exit(1); });
