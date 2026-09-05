import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function read(name: string): Promise<string> {
  return readFile(path.join(process.cwd(), name), "utf8");
}

async function main(): Promise<void> {
  const setup = await read("Setup-LEO.ps1");
  const launch = await read("Launch-LEO.ps1");
  const cmd = await read("Launch-LEO.cmd");
  const server = await read("web/server.ts");
  const pack = await read("Package-LEO.ps1");

  assert(setup.includes("RandomNumberGenerator"));
  assert(setup.includes("LEO_BACKUP_ROOT=E:/LEO-Backups"));
  assert(launch.includes("npm run ui"));
  assert(cmd.includes("powershell.exe"));
  assert(server.includes("Use Show-LEO-Token.ps1"));
  assert(!server.includes("console.log(UI_TOKEN)"));
  assert(pack.includes('"workspace"'));
  assert(pack.includes('"node_modules"'));

  console.log("PASS: Windows owner setup, launcher, secret handling and packaging safeguards.");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
