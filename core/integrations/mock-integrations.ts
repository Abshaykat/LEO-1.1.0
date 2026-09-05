export type IntegrationKind = "meta_ads" | "google_ads" | "tiktok_ads" | "shopify" | "courier" | "crm" | "broker";

export interface IntegrationResult {
  kind: IntegrationKind;
  operation: string;
  mode: "mock";
  accepted: boolean;
  message: string;
}

export function mockIntegration(kind: IntegrationKind, operation: string): IntegrationResult {
  if (!operation.trim()) throw new Error("Integration operation is required.");
  return {
    kind,
    operation: operation.trim(),
    mode: "mock",
    accepted: true,
    message: "Mock adapter accepted the operation. No external request was sent."
  };
}
