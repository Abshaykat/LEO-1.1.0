export interface EvalCase {
  id: string;
  description: string;
  run: () => Promise<boolean> | boolean;
}

export interface EvalResult {
  id: string;
  passed: boolean;
}

export async function runEvals(cases: EvalCase[]): Promise<{ passed: number; failed: number; results: EvalResult[] }> {
  const results: EvalResult[] = [];
  for (const testCase of cases) {
    let passed = false;
    try { passed = Boolean(await testCase.run()); } catch { passed = false; }
    results.push({ id: testCase.id, passed });
  }
  return {
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}
