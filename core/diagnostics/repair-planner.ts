import type {
  DiagnosticReport
} from "./diagnostic-types.ts";

import type {
  RepairPlan,
  RepairRisk,
  RepairStep
} from "./repair-types.ts";

function createId(): string {
  return crypto.randomUUID();
}

function inferRisk(
  report: DiagnosticReport
): RepairRisk {
  if (report.status === "failed") {
    return "medium";
  }

  if (report.status === "degraded") {
    return "low";
  }

  return "unknown";
}

function buildSteps(
  report: DiagnosticReport
): RepairStep[] {

  return report.issues.map(
    (issue, index) => ({
      order:
        index + 1,

      description:
        `Investigate and prepare a repair for: ${issue}`,

      rationale:
        "The diagnostic layer reported this issue. " +
        "Repair must be reviewed before any change is executed."
    })
  );
}

export class RepairPlanner {

  createPlan(
    report: DiagnosticReport
  ): RepairPlan {

    if (report.status === "healthy") {
      return {
        id:
          createId(),

        status:
          "no_repair_needed",

        issue:
          "No diagnosed issue requires repair.",

        confidence:
          report.confidence,

        risk:
          "low",

        steps:
          [],

        verification:
          [
            "Re-run diagnostics.",
            "Run the relevant regression tests.",
            "Confirm no new failures were introduced."
          ],

        requiresApproval:
          false
      };
    }

    if (
      report.issues.length === 0 ||
      report.confidence === 0
    ) {
      return {
        id:
          createId(),

        status:
          "insufficient_evidence",

        issue:
          "The system does not have enough diagnostic evidence to prepare a safe repair.",

        confidence:
          report.confidence,

        risk:
          "unknown",

        steps:
          [],

        verification:
          [
            "Collect additional diagnostic evidence.",
            "Re-run diagnostics before proposing a repair."
          ],

        requiresApproval:
          true
      };
    }

    const steps =
      buildSteps(report);

    return {
      id:
        createId(),

      status:
        "repair_available",

      issue:
        report.issues.join(" | "),

      rootCause:
        "Root cause requires verification from diagnostic evidence before modification.",

      confidence:
        report.confidence,

      risk:
        inferRisk(report),

      steps,

      verification:
        [
          "Re-run the failed diagnostic checks.",
          "Run TypeScript compilation.",
          "Run the relevant regression tests.",
          "Confirm the repair did not weaken security boundaries."
        ],

      requiresApproval:
        true
    };
  }
}
