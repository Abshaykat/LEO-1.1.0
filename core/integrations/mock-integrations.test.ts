import { mockIntegration } from "./mock-integrations.ts";

for (const kind of ["meta_ads", "google_ads", "tiktok_ads", "shopify", "courier", "crm", "broker"] as const) {
  const result = mockIntegration(kind, "validate integration contract");
  if (result.mode !== "mock" || !result.accepted) throw new Error(`Mock integration failed: ${kind}`);
}
console.log("PASS: External integration mock contracts.");
