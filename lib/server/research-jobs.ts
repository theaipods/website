import { randomUUID } from 'node:crypto';
import { db, type Database } from './db';
import { researchWebsite, publicUrl, type ResearchInput } from './website-research';
import { indexCompany } from './embeddings';
import type { ResearchJob } from '../research-types';
import { ApiError } from './auth';

export async function latestResearchJob(companyId:string,database:Database=db(),jobId?:string):Promise<ResearchJob|null>{
  const r=await database.one(`SELECT * FROM research_jobs WHERE company_id=?${jobId?' AND id=?':''} ORDER BY created DESC LIMIT 1`,jobId?[companyId,jobId]:[companyId]);
  if(!r)return null;
  return {id:String(r.id),companyId,website:String(r.website),status:r.status as ResearchJob['status'],stage:String(r.stage),completed:Number(r.completed),total:Number(r.total),report:r.report?JSON.parse(String(r.report)):null,error:String(r.error||''),created:String(r.created),updated:String(r.updated),input:JSON.parse(String(r.input))};
}
export async function enqueueResearch(companyId:string,ownerId:string,input:ResearchInput & {snapshot?:Record<string,string>},database:Database=db()){
  let website:string;
  try{website=publicUrl(input.website).href;for(const extra of input.extraUrls)publicUrl(extra);}catch(error){throw new ApiError(400,(error as Error).message);}
  let id:string=randomUUID();const now=new Date().toISOString();
  await database.transaction(async q=>{
    // Serialize submissions for this company across web processes.
    await q('UPDATE companies SET version=version WHERE id=? AND owner_id=?',[companyId,ownerId]);
    const active=await q("SELECT id FROM research_jobs WHERE company_id=? AND website=? AND status IN ('queued','running')",[companyId,website]);
    if(active.rows.length){id=String(active.rows[0].id);return;}
    await q("INSERT INTO research_jobs(id,company_id,owner_id,website,input,status,stage,created,updated) VALUES(?,?,?,?,?,'queued','Waiting for research worker',?,?)",[id,companyId,ownerId,website,JSON.stringify({...input,website}),now,now]);
  });
  return latestResearchJob(companyId,database,id);
}
export async function claimResearchJob(database:Database=db()){
  const lease=randomUUID(),now=new Date().toISOString(),stale=new Date(Date.now()-10*60000).toISOString();
  const result=await database.query("UPDATE research_jobs SET status='running',stage='Discovering sources',lease=?,updated=? WHERE id=(SELECT id FROM research_jobs WHERE status='queued' OR (status='running' AND updated<?) ORDER BY created LIMIT 1) AND (status='queued' OR (status='running' AND updated<?)) RETURNING *",[lease,now,stale,stale]);
  return result.rows[0];
}
export async function researchWorkerTick(database:Database=db()){
  const job=await claimResearchJob(database);if(!job)return false;
  const id=String(job.id),companyId=String(job.company_id),lease=String(job.lease);
  const update=async(stage:string,completed?:number,total?:number)=>{await database.query("UPDATE research_jobs SET stage=?,completed=COALESCE(?,completed),total=COALESCE(?,total),updated=? WHERE id=? AND lease=? AND status='running'",[stage,completed??null,total??null,new Date().toISOString(),id,lease]);};
  const heartbeat=setInterval(()=>{void database.query("UPDATE research_jobs SET updated=? WHERE id=? AND lease=? AND status='running'",[new Date().toISOString(),id,lease]).catch(()=>{});},15000);
  try{
    const report=await researchWebsite(JSON.parse(String(job.input)),update);
    const kid=`research-${id}`;report.knowledgeId=kid;
    const profile=report.suggestions.map(s=>`${s.field}: ${s.value}\nEvidence: ${s.source}`).join('\n');
    const content=[profile,...report.sources.filter(s=>s.status==='Stored').map(s=>`Source: ${s.url}\n${s.title}\n${s.kind==='directory'?'THIRD-PARTY: verify company facts.\n':''}${s.text}`)].filter(Boolean).join('\n\n').slice(0,180000);
    await update('Saving company knowledge');
    await database.transaction(async q=>{
      const current=await q('SELECT lease FROM research_jobs WHERE id=?',[id]);if(current.rows[0]?.lease!==lease)throw new Error('Research job was reclaimed.');
      const blob=Buffer.from(JSON.stringify(report));
      await q('INSERT INTO knowledge(id,company_id,name,size,type,category,status,content,blob,created) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET content=excluded.content,blob=excluded.blob,status=excluded.status,size=excluded.size',[kid,companyId,`company-research-${new URL(String(job.website)).hostname}.json`,blob.length,'application/json','Website research',`${report.sources.filter(s=>s.status==='Stored').length} sources stored`,content,blob.toString('base64'),new Date().toISOString()]);
      await q('DELETE FROM chunks WHERE knowledge_id=?',[kid]);
      for(let pos=0,ordinal=0;pos<content.length;pos+=1000,ordinal++)await q('INSERT INTO chunks(id,knowledge_id,company_id,content,ordinal) VALUES(?,?,?,?,?)',[`${kid}:${ordinal}`,kid,companyId,content.slice(pos,pos+1200),ordinal]);
    });
    await update('Building semantic index');
    report.index=await indexCompany(companyId,kid,database);
    const blob=Buffer.from(JSON.stringify(report));
    await database.query('UPDATE knowledge SET blob=?,size=? WHERE id=?',[blob.toString('base64'),blob.length,kid]);
    await database.query("UPDATE research_jobs SET status='complete',stage='Profile ready to review',report=?,updated=? WHERE id=? AND lease=?",[JSON.stringify(report),new Date().toISOString(),id,lease]);
    await database.query('INSERT INTO audit(id,user_id,company_id,action,at) VALUES(?,?,?,?,?)',[randomUUID(),String(job.owner_id),companyId,`Website research completed: ${report.outcome}; ${report.suggestions.length} profile fields; ${report.index.indexed} indexed chunks.`,new Date().toISOString()]);
  }catch(e){await database.query("UPDATE research_jobs SET status='failed',stage='Research needs attention',error=?,updated=? WHERE id=? AND lease=?",[(e as Error).message.slice(0,400),new Date().toISOString(),id,lease]);}
  finally{clearInterval(heartbeat);}
  return true;
}
