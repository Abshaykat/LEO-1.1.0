export type DiagnosticStatus =
  | "healthy"
  | "degraded"
  | "failed"
  | "unknown";

export interface DiagnosticCheck {
  name: string;
  status: DiagnosticStatus;
  message: string;
  evidence?: string[];
}

export interface DiagnosticReport {
  status: DiagnosticStatus;
  confidence: number;
  checks: DiagnosticCheck[];
  issues: string[];
  recommendations: string[];
  requiresApproval: boolean;
}

export interface DiagnosticProvider {
  runChecks(): Promise<DiagnosticCheck[]>;
}
