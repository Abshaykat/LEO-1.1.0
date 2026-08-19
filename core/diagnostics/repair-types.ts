export type RepairRisk =
  | "low"
  | "medium"
  | "high"
  | "unknown";

export interface RepairStep {
  order: number;
  description: string;
  target?: string;
  rationale: string;
}

export interface RepairPlan {
  id: string;
  status: "repair_available" | "no_repair_needed" | "insufficient_evidence";
  issue: string;
  rootCause?: string;
  confidence: number;
  risk: RepairRisk;
  steps: RepairStep[];
  verification: string[];
  requiresApproval: boolean;
}
