import type { CompanyInput } from './workforce';
import type { ResearchReport } from './research-types';
export function researchHost(value:string){try{return new URL(/^https?:\/\//i.test(value)?value:`https://${value}`).hostname.toLowerCase().replace(/^www\./,'');}catch{return '';}}
export const profileFields=['name','industry','size','businessModel','geography','products','about'] as const;
export function changeResearchWebsite(draft:CompanyInput,website:string):CompanyInput {
  const changed=researchHost(website)&&researchHost(website)!==researchHost(draft.website);
  if(!changed)return {...draft,website};
  return {...draft,website,name:researchHost(website),industry:'',size:'',businessModel:'',geography:'',products:'',about:''};
}
export function prefillResearch(current:CompanyInput,snapshot:CompanyInput,report:ResearchReport):CompanyInput {
  if(researchHost(current.website)!==researchHost(report.website))return current;
  const next={...current};
  for(const f of report.suggestions){if(current[f.field]===snapshot[f.field]||!current[f.field])next[f.field]=f.value;}
  return next;
}
