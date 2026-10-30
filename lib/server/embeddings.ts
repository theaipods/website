import { createHash } from 'node:crypto';
import { db, type Database } from './db';

export function embeddingConfig() {
  const provider = (process.env.AI_PROVIDER || 'legacy').trim().toLowerCase();
  if (provider === 'nvidia') return { provider, model: process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/nemotron-3.5-embed-1b', url: 'https://integrate.api.nvidia.com/v1/embeddings', key: process.env.NVIDIA_API_KEY || '' };
  if (provider === 'azure') {
    const base = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, '');
    return { provider, model: process.env.AZURE_EMBEDDING_DEPLOYMENT || '', url: base ? `${base.endsWith('/openai/v1') ? base : `${base}/openai/v1`}/embeddings` : '', key: process.env.AZURE_OPENAI_API_KEY || '' };
  }
  return { provider, model: '', url: '', key: '' };
}
export const embeddingIdentity = () => { const c = embeddingConfig(); return `${c.provider}:${c.url}:${c.model}`; };
export const embeddingReady = () => { const c = embeddingConfig(); return !!(c.model && c.key && c.url.startsWith('https://')); };
export async function embedTexts(input: string[], type: 'passage' | 'query'): Promise<number[][]> {
  const c = embeddingConfig();
  if (!embeddingReady()) throw new Error('Embedding provider is not configured.');
  if (!input.length) return [];
  const res = await fetch(c.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(c.provider === 'azure' ? {'api-key': c.key} : {Authorization: `Bearer ${c.key}`}) },
    body: JSON.stringify({ model: c.model, input, encoding_format: 'float', ...(c.provider === 'nvidia' ? {input_type: type, truncate: 'END'} : {}) }), signal: AbortSignal.timeout(45000), redirect: 'error' });
  if (!res.ok) throw new Error(`Embedding provider returned ${res.status}.`);
  const data = await res.json();
  const rows = data.data?.sort((a: {index:number}, b: {index:number}) => a.index-b.index);
  if (!Array.isArray(rows) || rows.length !== input.length) throw new Error('Invalid embedding response.');
  const size = rows[0]?.embedding?.length;
  if (!size || size > 16384 || rows.some((r, i) => r.index !== i || !Array.isArray(r.embedding) || r.embedding.length !== size || r.embedding.some((n:unknown) => typeof n !== 'number' || !Number.isFinite(n)))) throw new Error('Invalid embedding vectors.');
  return rows.map(r => r.embedding);
}
export function cosine(a: number[], b: number[]) {
  if (a.length !== b.length) return 0;
  let dot=0, aa=0, bb=0;
  for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}
  return aa && bb ? dot/Math.sqrt(aa*bb) : 0;
}
export async function indexCompany(companyId: string, knowledgeId?: string, database: Database = db(), limit=Infinity) {
  if (!embeddingReady()) return {status:'unavailable', indexed:0, detail:'Embedding provider is not configured; readable text remains available.'};
  const model=embeddingIdentity();
  const rows=await database.all(`SELECT c.id,c.content,e.content_hash FROM chunks c LEFT JOIN chunk_embeddings e ON e.chunk_id=c.id AND e.model=? WHERE c.company_id=?${knowledgeId?' AND c.knowledge_id=?':''} ORDER BY c.id`,knowledgeId?[model,companyId,knowledgeId]:[model,companyId]);
  const pending=rows.map(r=>({id:String(r.id),content:String(r.content),content_hash:r.content_hash,hash:createHash('sha256').update(String(r.content)).digest('hex')})).filter(r=>r.content_hash!==r.hash);
  let indexed=0;
  try {
    for(let i=0;i<Math.min(limit,pending.length);i+=16){
      const batch=pending.slice(i,Math.min(i+16,limit));const vectors=await embedTexts(batch.map(r=>String(r.content)),'passage');
      await database.transaction(async query=>{for(let j=0;j<batch.length;j++)await query('INSERT INTO chunk_embeddings(chunk_id,model,content_hash,vector,created) VALUES(?,?,?,?,?) ON CONFLICT(chunk_id,model) DO UPDATE SET content_hash=excluded.content_hash,vector=excluded.vector,created=excluded.created',[String(batch[j].id),model,batch[j].hash,JSON.stringify(vectors[j]),new Date().toISOString()]);});
      indexed+=batch.length;
    }
    const complete=indexed===pending.length;
    return {status:complete?'complete':'partial', indexed:rows.length-pending.length+indexed, detail:complete?`${rows.length} text chunks indexed with ${embeddingConfig().model}.`:'Indexing continues in the background.'};
  } catch(e){return {status:'partial',indexed,detail:`${(e as Error).message} Saved text is retained; keyword retrieval remains available.`};}
}

// Also index uploaded text and connected document chunks, without re-crawling their sources.
export async function indexPendingKnowledge(database:Database=db()){
  if(!embeddingReady())return;
  const next=await database.one('SELECT c.company_id,c.knowledge_id FROM chunks c LEFT JOIN chunk_embeddings e ON e.chunk_id=c.id AND e.model=? WHERE e.chunk_id IS NULL ORDER BY c.id LIMIT 1',[embeddingIdentity()]);
  if(next)return indexCompany(String(next.company_id),String(next.knowledge_id),database,64);
}
