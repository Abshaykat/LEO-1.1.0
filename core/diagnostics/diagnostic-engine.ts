import type {
  DiagnosticCheck,
  DiagnosticReport,
  DiagnosticStatus,
  DiagnosticProvider
} from "./diagnostic-types.ts";

function calculateStatus(
  checks: DiagnosticCheck[]
): DiagnosticStatus {

  if (checks.length === 0) {
    return "unknown";
  }

  if (checks.some(check => check.status === "failed")) {
    return "failed";
  }

  if (checks.some(check => check.status === "degraded")) {
    return "degraded";
  }

  if (checks.every(check => check.status === "healthy")) {
    return "healthy";
  }

  return "unknown";
}

function calculateConfidence(
  checks: DiagnosticCheck[]
): number {

  if (checks.length === 0) {
    return 0;
  }

  const known =
    checks.filter(
      check => check.status !== "unknown"
    ).length;

  return Number(
    ((known / checks.length) * 100).toFixed(2)
  );
}

export class DiagnosticEngine {

  constructor(
    private readonly provider: DiagnosticProvider
  ) {}

  async diagnose(): Promise<DiagnosticReport> {

    const checks =
      await this.provider.runChecks();

    const status =
      calculateStatus(checks);

    const issues =
      checks
        .filter(
          check =>
            check.status === "failed" ||
            check.status === "degraded"
        )
        .map(check => check.message);

    const recommendations =
      checks
        .filter(
          check =>
            check.status === "failed" ||
            check.status === "degraded"
        )
        .map(
          check =>
            `Investigate: ${check.name}`
        );

    return {
      status,
      confidence:
        calculateConfidence(checks),
      checks,
      issues,
      recommendations,
      requiresApproval:
        false
    };
  }
}

