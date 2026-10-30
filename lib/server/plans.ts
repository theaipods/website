import { randomUUID } from "node:crypto";
import { plans, type PlanId } from "../plans";
import type { Run } from "../workforce";
import { ApiError } from "./auth";
import { db } from "./db";

export async function accountPlan(owner: string) {
  const row = await db().one("SELECT plan FROM account_plans WHERE user_id=?", [owner]);
  const id: PlanId = row && String(row.plan) in plans ? row.plan as PlanId : "starter";
  const counts = await db().one("SELECT (SELECT COUNT(*) FROM pods p JOIN companies c ON c.id=p.company_id WHERE c.owner_id=?) AS pods,(SELECT COUNT(*) FROM projects WHERE owner_id=?) AS projects", [owner, owner]);
  return { id, ...plans[id], usedPods: Number(counts?.pods || 0), usedProjects: Number(counts?.projects || 0) };
}
export async function insertProjectPod(owner: string, pod: Run, requestKey?: string) {
  const projectId = randomUUID();
  const saved = { ...pod, projectId };
  return db().transaction(async query => {
    await query("INSERT INTO account_plans(user_id,plan,updated) VALUES(?,'starter',?) ON CONFLICT(user_id) DO NOTHING", [owner, new Date().toISOString()]);
    // A row lock serializes quota checks across PostgreSQL web processes.
    const row = (await query(`SELECT plan FROM account_plans WHERE user_id=?${db().pool ? " FOR UPDATE" : ""}`, [owner])).rows[0];
    if (requestKey) {
      const existing = (await query("SELECT p.data,p.version FROM demo_requests r JOIN pods p ON p.id=r.pod_id WHERE r.owner_id=? AND r.request_key=?", [owner,requestKey])).rows[0];
      if (existing) return {...JSON.parse(String(existing.data)),version:Number(existing.version)} as Run;
    }
    const plan = plans[(String(row.plan) in plans ? row.plan : "starter") as PlanId];
    const counts = (await query("SELECT (SELECT COUNT(*) FROM pods p JOIN companies c ON c.id=p.company_id WHERE c.owner_id=?) AS pods,(SELECT COUNT(*) FROM projects WHERE owner_id=?) AS projects", [owner, owner])).rows[0];
    if (plan.pods !== null && Number(counts.pods) >= plan.pods || plan.projects !== null && Number(counts.projects) >= plan.projects) throw new ApiError(403, `${plan.name} allows ${plan.pods} Pod(s) and ${plan.projects} project(s). Ask an administrator to upgrade your plan before creating more.`);
    await query("INSERT INTO projects(id,owner_id,company_id,name,created) VALUES(?,?,?,?,?)", [projectId, owner, pod.companyId, pod.name, pod.created]);
    await query("INSERT INTO pods(id,company_id,data,created) VALUES(?,?,?,?)", [pod.id, pod.companyId, JSON.stringify(saved), pod.created]);
    if (requestKey) await query("INSERT INTO demo_requests(owner_id,request_key,pod_id) VALUES(?,?,?)",[owner,requestKey,pod.id]);
    return saved;
  });
}
