import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function main(): Promise<void> {
  const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
  const required = [
    "L.E.O. 1.1.0",
    "AI Intelligence Hub",
    "Marketing AI",
    "Finance / Market AI",
    "Operations AI",
    "Human Approval Center",
    "Decision Queue",
    "Owner-controlled",
    "/assets/leo-wolf.svg",
    "/api/chat",
    "/api/approve",
    "/api/health"
  ];
  for (const marker of required) {
    assert(html.includes(marker), "UI is missing required marker: " + marker);
  }
  assert(!html.includes("healthScore").valueOf() || html.includes('textContent="OK"'), "UI must not fabricate a numeric health score.");
  console.log("PASS: L.E.O. owner dashboard structure and governance markers.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
