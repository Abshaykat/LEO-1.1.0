import { runEvals } from "./eval-harness.ts";

async function main() {
  const result = await runEvals([
    { id: "approval-boundary", description: "Approval remains required", run: () => true },
    { id: "security-boundary", description: "Unauthorized authority is denied", run: () => true }
  ]);
  if (result.passed !== 2 || result.failed !== 0) throw new Error("Eval harness failed.");
  console.log("PASS: L.E.O. evaluation harness.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
