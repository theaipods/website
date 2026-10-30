import type { CompanyInput } from './workforce';

export type CompanyOutcome = { id: string; metric: string; baseline: string; target: string; timeframe: string };
export function companyOutcomes(company: CompanyInput): CompanyOutcome[] {
  if (company.outcomes !== undefined) return company.outcomes;
  return company.metric ? [{ id: 'primary', metric: company.metric, baseline: company.baseline, target: company.target, timeframe: company.timeframe }] : [];
}
export function withOutcomes(company: CompanyInput, outcomes: CompanyOutcome[]): CompanyInput {
  const first = outcomes[0];
  return { ...company, outcomes, metric: first?.metric || '', baseline: first?.baseline || '', target: first?.target || '', timeframe: first?.timeframe || '' };
}
export function outcomesComplete(company: CompanyInput) {
  const outcomes = companyOutcomes(company);
  return outcomes.length > 0 && outcomes.every(o => [o.metric,o.baseline,o.target,o.timeframe].every(v => v.trim()));
}
