export interface MarketingResearchBrief {
  objective: string;
  channels: string[];
  geography?: string[];
  audience?: string[];
  requiredEvidence: string[];
  confidenceRule: string;
}

export function createMarketingResearchBrief(
  objective: string,
  channels: string[],
  geography: string[] = [],
  audience: string[] = []
): MarketingResearchBrief {
  if (!objective.trim()) throw new Error("Marketing objective is required.");
  return {
    objective: objective.trim(),
    channels,
    geography,
    audience,
    requiredEvidence: [
      "Current platform behavior or policy source.",
      "Current audience or market evidence.",
      "Explicit separation between observed data and recommendation.",
      "Timestamp for all time-sensitive evidence."
    ],
    confidenceRule:
      "Do not present a recommendation as high-confidence when the supporting data is incomplete or stale."
  };
}
