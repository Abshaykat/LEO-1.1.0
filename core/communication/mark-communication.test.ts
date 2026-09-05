import {
  buildMarkStyleSystemPrompt,
  detectCommunicationLanguage,
  normalizeAssistantResponse
} from "./mark-communication.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const cases: Array<[string, string]> = [
  ["Open Chrome", "english"],
  ["Chrome ta open koro", "english"],
  ["ক্রোমটা খুলে দাও", "bangla"],
  ["Chrome টা open koro", "mixed"]
];

for (const [input, expected] of cases) {
  assert(
    detectCommunicationLanguage(input) === expected,
    "Language detection failed for: " + input
  );
}

const prompt = buildMarkStyleSystemPrompt({
  userMessage: "Leo Chrome ta open koro",
  conversationSize: 2
});

assert(prompt.includes("Bangla"), "Prompt must include Bangla support.");
assert(prompt.includes("Banglish"), "Prompt must include Banglish support.");
assert(prompt.includes("MOST RECENT message"), "Prompt must enforce latest-message language.");
assert(prompt.includes("permission"), "Prompt must preserve permission boundaries.");
assert(prompt.includes("owner-approval"), "Prompt must preserve owner approval.");

assert(
  normalizeAssistantResponse("  hello  \n\n\n world  ") === "hello\n\n world",
  "Response normalization failed."
);

console.log("PASS: Mark communication module tests");
