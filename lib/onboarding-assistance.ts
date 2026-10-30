import { companyOutcomes } from './company-outcomes';
import { companySchema, type CompanyInput } from './workforce';

const assistanceSections: Record<number, (keyof CompanyInput)[]> = {
  0: ['name','industry','size','businessModel','geography','products','about'],
  1: ['goals','outcomes'], 2: ['teams'], 3: ['domains'],
  4: ['answers'], 5: ['processes'], 6: ['processes'], 7: ['tools'],
  8: ['processDocumentation'], 9: ['brand'], 10: ['rules'],
  11: ['processes'], 13: ['processes'], 14: ['recommendedPods'],
};
export type OnboardingSuggestion = { field: keyof CompanyInput; value: unknown; reason: string; sources: string[]; kind: 'evidence' | 'proposal' };
export type AssistanceResult = { suggestions: OnboardingSuggestion[]; warnings: string[]; at: string; model: string };
export function appendCustomTeams(current:CompanyInput['teams'], suggested:CompanyInput['teams']) {
  const result=[...current];
  for(const team of suggested){
    if(result.length>=40)break;
    if(!team.name.trim()||result.some(t=>t.id===team.id||t.name.trim().toLowerCase()===team.name.trim().toLowerCase()))continue;
    result.push(team);
  }
  return result;
}
export function readinessStep(gap: string) {
  if(gap.startsWith('Outcomes:'))return 1;
  if (['metric','baseline','target','timeframe'].includes(gap)) return 1;
  if (gap.startsWith('Tools:')) return 7;
  if (gap.startsWith('Knowledge:')) return 8;
  if (gap.includes('business rules')) return 10;
  if (gap.includes('recommended pod')) return 14;
  if (gap.includes('department') || gap.includes('discovery methods')) return 3;
  if (gap.includes('process owners')) return 6;
  if (gap.includes(':')) return 4;
  return 0;
}
export function brandTextColor(background: string) {
  const rgb=background.replace('#','').match(/.{2}/g)?.map(v=>parseInt(v,16)/255) || [1,1,1];
  const linear=rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  const luminance=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];
  return luminance>.179?'#000000':'#ffffff';
}

// One allowlist shared by server validation and the review UI. Permissions,
// activation remain manual. Numeric proposals must be labeled planning estimates.
export function assistanceFields(section: number | 'all') {
  return section === 'all' ? [...new Set(Object.values(assistanceSections).flat())] : assistanceSections[section] || [];
}
export function validateSuggestion(field: string, value: unknown, current: CompanyInput): string | undefined {
  if (!assistanceFields('all').includes(field as keyof CompanyInput)) return 'This field requires a person.';
  const result = companySchema.shape[field as keyof typeof companySchema.shape].safeParse(value);
  if (!result.success) return result.error.issues.map(i => i.message).join('; ');
  if (field === 'brand' && (value as CompanyInput['brand']).logoId !== current.brand.logoId) return 'Uploaded logos cannot be changed by AI.';
  if(field==='outcomes'){
    if(!Array.isArray(value))return 'Provide a list of measurable outcomes.';
    const previous=companyOutcomes(current);
    for(const item of value as NonNullable<CompanyInput['outcomes']>){
      const existing=previous.find(o=>o.id===item.id);
      if(item.baseline && item.baseline!==existing?.baseline&&!/estimate/i.test(item.baseline))return 'Proposed baselines must be labeled planning estimates.';
      if(item.target && item.target!==existing?.target&&!/estimate/i.test(item.target))return 'Proposed targets must be labeled planning estimates.';
    }
  }
  if(field==='teams' && new Set((value as CompanyInput['teams']).map(t=>t.id)).size!==(value as CompanyInput['teams']).length)return 'Team IDs must be unique.';
  if (field === 'teams' && (value as CompanyInput['teams']).some(t => t.count && t.count !== current.teams.find(c => c.id === t.id)?.count&&!/estimate/i.test(t.count))) return 'Proposed headcounts must be labeled planning estimates.';
  if (field === 'processes') {
    const next = value as CompanyInput['processes'];
    for (const [domain, steps] of Object.entries(next)) {
      if (!current.domains.includes(domain)) return 'Select this department before mapping its process.';
      if (steps.some(s => s.control === 'AI handles')) return 'AI suggestions cannot grant automatic execution.';
    }
    for (const [domain, steps] of Object.entries(current.processes)) for (const step of steps) {
      if (step.control === 'Human only' && next[domain]?.find(s => s.id === step.id)?.control !== 'Human only') return 'Human-only checkpoints must be preserved.';
    }
  }
  if (field === 'recommendedPods' && (value as string[]).some(id => !current.domains.includes(id))) return 'Recommendations must use selected departments.';
}

export function mergeSavedDraft(current: CompanyInput, submitted: CompanyInput, persisted: CompanyInput): CompanyInput {
  const merged = { ...persisted };
  for (const key of Object.keys(companySchema.shape) as (keyof CompanyInput)[]) {
    if (JSON.stringify(current[key]) !== JSON.stringify(submitted[key])) Object.assign(merged, { [key]: current[key] });
  }
  return merged;
}
