export interface VerificationResult {
  verified: boolean;
  confidence: number;
  summary: string;
  evidence: string[];
}

export function verifyExecutionResult(
  result: unknown,
  expected?: (result: unknown) => boolean
): VerificationResult {
  if (expected) {
    const verified = expected(result);
    return {
      verified,
      confidence: verified ? 100 : 0,
      summary: verified ? "Post-condition verified." : "Post-condition failed.",
      evidence: [JSON.stringify(result)]
    };
  }

  return {
    verified: true,
    confidence: 70,
    summary: "Executor returned successfully; no independent post-condition was supplied.",
    evidence: [JSON.stringify(result)]
  };
}
