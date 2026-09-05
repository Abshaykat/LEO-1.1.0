import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main(): Promise<void> {
  const html = await readFile(
    path.join(process.cwd(), "web", "index.html"),
    "utf8"
  );

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

  assert(
    !html.includes('id="voiceLang"'),
    "Desktop UI must not require manual language selection."
  );

  assert(
    html.includes("detectInputLanguage"),
    "Desktop voice input must use automatic language detection."
  );

  assert(
    html.includes("preferredVoiceLanguage"),
    "Desktop voice input must adapt its recognition language automatically."
  );

  assert(
    html.includes("speechSynthesis"),
    "Desktop UI must support spoken L.E.O. replies when the browser provides speech synthesis."
  );

  assert(
    html.includes("speakLeo"),
    "Desktop UI must route L.E.O. replies to spoken output."
  );

  assert(
    html.includes("Language is detected automatically"),
    "Desktop UI must communicate automatic language detection."
  );

  assert(
    html.includes("liveClock"),
    "Desktop UI must display live date/time."
  );

  assert(
    html.includes("localStorage"),
    "Desktop UI must preserve recent chat context across refreshes."
  );

  assert(
    html.includes("timestamp"),
    "Desktop UI must timestamp chat messages."
  );

  assert(
    html.includes('id="healthScore">OK'),
    "UI must not present a fabricated numeric health score."
  );

  console.log("PASS: L.E.O. owner dashboard structure and governance markers.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
