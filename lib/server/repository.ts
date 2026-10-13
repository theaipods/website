import { randomUUID } from "node:crypto";
import type { Business, CompanyInput, Run, Knowledge } from "../workforce";
import { defaultCompany } from "../workforce";
import { db } from "./db";
import { ApiError } from "./auth";

export async function audit(userId: string, companyId: string | null, action: string) { await db().query("INSERT INTO audit(id,user_id,company_id,action,at) VALUES(?,?,?,?,?)", [randomUUID(), userId, companyId, action, new Date().toISOString()]); }
export async function companyFor(id: string, owner: string): Promise<Business> {
  const row = await db().one("SELECT * FROM companies WHERE id=? AND owner_id=?", [id, owner]);
  if (!row) throw new ApiError(404, "Company not found.");
  return { ...defaultCompany(), ...JSON.parse(String(row.data)), id: String(row.id), version: Number(row.version), created: String(row.created) };
}
export async function companiesFor(owner: string): Promise<Business[]> {
  const rows = await db().all("SELECT * FROM companies WHERE owner_id=? ORDER BY created DESC", [owner]);
  return rows.map(row => ({ ...defaultCompany(), ...JSON.parse(String(row.data)), id: row.id, version: Number(row.version), created: row.created }));
}
export async function saveCompany(owner: string, input: CompanyInput, id?: string, version?: number) {
  if (!id) {
    id = randomUUID();
    await db().query("INSERT INTO companies(id,owner_id,data,created) VALUES(?,?,?,?)", [id, owner, JSON.stringify(input), new Date().toISOString()]);
  } else {
    await companyFor(id, owner);
    const result = await db().query("UPDATE companies SET data=?,version=version+1 WHERE id=? AND owner_id=? AND version=?", [JSON.stringify(input), id, owner, version || 0]);
    if (!result.changes) throw new ApiError(409, "This company changed in another session. Reload before saving.");
  }
  await audit(owner, id, `Company ${input.status === "active" ? "saved / activated" : "draft saved"}`);
  return companyFor(id, owner);
}
export async function podFor(id: string, owner: string): Promise<Run> {
  const row = await db().one("SELECT p.* FROM pods p JOIN companies c ON c.id=p.company_id WHERE p.id=? AND c.owner_id=?", [id, owner]);
  if (!row) throw new ApiError(404, "Pod not found.");
  return { ...JSON.parse(String(row.data)), version: Number(row.version) };
}
export async function savePod(pod: Run) {
  const result = await db().query("UPDATE pods SET data=?,version=version+1 WHERE id=? AND version=?", [JSON.stringify({ ...pod, version: pod.version + 1 }), pod.id, pod.version]);
  if (!result.changes) throw new ApiError(409, "Pod changed while processing. Refresh and try again.");
  return { ...pod, version: pod.version + 1 };
}
export async function knowledgeFor(companyId: string): Promise<Knowledge[]> {
  const rows = await db().all("SELECT k.id,k.company_id,k.name,k.size,k.type,k.category,k.status,k.created,(SELECT COUNT(*) FROM chunks c WHERE c.knowledge_id=k.id) AS chunks FROM knowledge k WHERE k.company_id=? ORDER BY k.created DESC", [companyId]);
  return rows.map(r => ({ id: String(r.id), companyId: String(r.company_id), name: String(r.name), size: Number(r.size), type: String(r.type), category: String(r.category), status: String(r.status), chunks: Number(r.chunks), created: String(r.created) }));
}
