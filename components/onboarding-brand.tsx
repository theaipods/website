"use client";
import { useEffect, useState } from 'react';
import type { ResearchReport } from '@/lib/research-types';
import type { CompanyInput } from '@/lib/workforce';
import { api } from './platform-context';
import { Button, Notice } from './platform-ui';
export function OnboardingBrand({ companyId, brand, apply }: { companyId?: string; brand: CompanyInput['brand']; apply: (brand: CompanyInput['brand'])=>void }) {
  const [report,setReport]=useState<ResearchReport|null>(null);
  useEffect(()=>{if(companyId)void api<ResearchReport|null>(`companies/${companyId}/research`).then(setReport).catch(()=>{});},[companyId]);
  return <section className="brand-findings"><h2>Brand clues from your website</h2><p>Colors and fonts are candidates, not a verified brand guide. Applying them changes your company’s brand settings, not this application’s theme.</p>
    {report?.brand?.length?<div>{report.brand.map((b,i)=><div className="brand-finding" key={i}><span>{b.field==='primary'||b.field==='secondary'?<i style={{background:b.value}}/>:null}<b>{b.field}</b><code>{b.value}</code><small>{b.method}</small><a href={b.source} target="_blank" rel="noreferrer">View source</a></span>{b.field!=='logo'&&<Button secondary onClick={()=>apply({...brand,[b.field]:b.value})}>Use candidate</Button>}</div>)}</div>:<Notice>Analyze your website in Company to discover brand candidates, or enter your brand below. No extraction is required to continue.</Notice>}
  </section>;
}
