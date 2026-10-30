import { db, type Database } from './db';
import { createHash } from 'node:crypto';
import { cosine, embedTexts, embeddingIdentity, embeddingReady } from './embeddings';
import { researchHost } from '../research-state';

export async function retrieveKnowledge(companyId: string, query: string, knowledgeIds?: string[], semantic=true, website?:string, database:Database=db()) {
  if (knowledgeIds && !knowledgeIds.length) return [];
  const company=await database.one('SELECT data FROM companies WHERE id=?',[companyId]);
  const currentWebsite=website ?? (company?JSON.parse(String(company.data)).website:'');
  const rows=await database.all('SELECT c.id,c.knowledge_id,c.content,k.name,k.category,e.vector,e.content_hash FROM chunks c JOIN knowledge k ON k.id=c.knowledge_id LEFT JOIN chunk_embeddings e ON e.chunk_id=c.id AND e.model=? WHERE c.company_id=?',[embeddingIdentity(),companyId]);
  for(const r of rows)if(r.content_hash!==createHash('sha256').update(String(r.content)).digest('hex'))r.vector=null;
  // Research from an old website must not silently describe a renamed company.
  const research=await database.all("SELECT id,blob FROM knowledge WHERE company_id=? AND category='Website research'",[companyId]);
  const stale=new Set(research.filter(r=>{try{return researchHost(JSON.parse(Buffer.from(String(r.blob),'base64').toString()).website)!==researchHost(currentWebsite);}catch{return true;}}).map(r=>String(r.id)));
  const eligible=rows.filter(r=>(!knowledgeIds||knowledgeIds.includes(String(r.knowledge_id)))&&!stale.has(String(r.knowledge_id)));
  let vector:number[]|undefined;
  if(semantic&&eligible.some(r=>r.vector)&&embeddingReady())try{[vector]=await embedTexts([query.slice(0,6000)],'query');}catch{/* explicit lexical fallback below */}
  const terms=[...new Set(query.toLowerCase().split(/\W+/).filter(t=>t.length>3))];
  return eligible.map(r=>{
    const text=String(r.content);const lexical=terms.filter(t=>text.toLowerCase().includes(t)).length/Math.max(1,terms.length);
    let similarity=0;try{if(vector&&r.vector)similarity=cosine(vector,JSON.parse(String(r.vector)));}catch{}
    return {id:String(r.id),knowledgeId:String(r.knowledge_id),name:String(r.name),text,score:vector?similarity*.8+lexical*.2:lexical,retrieval:vector?'semantic + keyword':'keyword'};
  }).sort((a,b)=>b.score-a.score).slice(0,12);
}
