/** Optional local-only operational demo. Never runs during server startup or production builds. */
import { randomUUID } from "node:crypto";
import { db } from "../lib/server/db";
import { seedAdmin } from "../lib/server/auth";
import { companyFor } from "../lib/server/repository";
import { advancePod, buildRun, decideTask } from "../lib/server/orchestrator";
import { agents, defaultCompany, domains, podQuestions, type ProcessStep, type PodInput, type Run } from "../lib/workforce";

async function main() {
if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEMO_ADMIN === "false") throw new Error("The IPO demo seed runs only with the local demo admin enabled.");
await seedAdmin();
const admin = await db().one("SELECT id FROM users WHERE email='admin@local.test'");
if (!admin) throw new Error("Local demo admin is unavailable.");
const owner = String(admin.id);
const demoName = "Investment Bank Demo (fictional)";
const old = await db().one("SELECT id FROM companies WHERE owner_id=? AND data LIKE ?", [owner, `%${demoName}%`]);
if (old) { process.stdout.write(`Demo already exists: ${old.id}\n`); process.exit(0); }
const company = defaultCompany();
Object.assign(company, { name:demoName, website:"", industry:"Financial services", size:"21–50", businessModel:"Hypothetical advisory simulation", geography:"India", products:"Illustrative due-diligence exercise", about:"Fictional training scenario. No relationship with Flipkart.com or any investment bank; no real financial statements or investment conclusions are represented.", goals:["Assess IPO readiness"], metric:"Reviewed diligence workstreams", baseline:"Demo only", target:"Reviewed hypothetical report", timeframe:"Simulation", domains:["finance","data","legal","it","ops"], recommendedPods:["finance"], discovery:["Interview","Existing tools","SOPs / documents"], noExistingTools:true, processDocumentation:"Demo-only procedure; all source claims require real evidence before use.", status:"active" });
company.permissions = { readKnowledge:true, draft:true, external:false, financial:true, production:false, sensitive:true };
const finance = domains.find(d => d.id === "finance")!;
company.answers.finance = Object.fromEntries(finance.questions.map(q => [q.id, "Hypothetical demo requirement; confirm with authorized sources before any real work."]));
const steps: [string,string][] = [
  ["Extract historical financial statements","Finance Agent"], ["Analyze revenue quality","Finance Agent"], ["Review debt structure","Audit Agent"], ["Analyze market position","Market Researcher"], ["Map market landscape","Market Researcher"], ["Review regulatory disclosures","Compliance Analyst"], ["Analyze valuation inputs","Finance Agent"], ["Analyze technology infrastructure","Backend Developer"], ["Assess infrastructure exposure","Cloud Engineer"], ["Identify governance considerations","Compliance Analyst"], ["Validate financial assumptions","Finance Agent"], ["Cross-check management claims","Audit Agent"], ["Review supporting evidence","Audit Agent"], ["Generate diligence summary","Business Analyst"], ["Assemble final report","Business Analyst"],
];
const roleIds = [...new Set(steps.map(([,name]) => agents.find(a => a.name === name)?.id).filter((id): id is string => !!id))];
if (roleIds.length < 10) throw new Error("The shared Agent Registry is missing demo specialists.");
company.processes.finance = steps.map(([name,agentName],i): ProcessStep => ({ id:`demo-finance-${i}`, name, agentId:agents.find(a => a.name === agentName)!.id, owner:"Demo pod manager", support:"", approver:"Human demo owner", tools:"No external tool connection", output:"Evidence-backed draft for human review", duration:"", control:i === 5 || i === 14 ? "Human approves" : "AI recommends", accepted:true }));
const companyId = randomUUID();
await db().query("INSERT INTO companies(id,owner_id,data,created) VALUES(?,?,?,?)", [companyId,owner,JSON.stringify(company),new Date().toISOString()]);
const saved = await companyFor(companyId,owner);
const answers = Object.fromEntries([...podQuestions,...finance.questions].map(q => [q.id, q.id === "scope" ? "Hypothetical IPO readiness exercise only; do not claim actual financial facts or a real engagement." : q.id === "acceptance" ? "Every claim is labeled illustrative and the final report remains subject to human approval." : "Demo input; replace with verified company evidence before real execution."]));
const input: PodInput = { name:"IPO Diligence Pod · DEMO", objective:"Hypothetical assessment of Flipkart.com IPO readiness for a fictional training scenario; no relationship or real diligence is implied.", domain:"finance", answers, roleIds, knowledgeIds:[], autonomy:2, mode:"simulation", requested:["chat"] };
const pod: Run = buildRun(saved,input);
pod.status = "Queued";
pod.tasks.forEach((task,i) => { if (i === 6 || i === 15) task.priority = "High"; });
await db().query("INSERT INTO pods(id,company_id,data,created) VALUES(?,?,?,?)", [pod.id,companyId,JSON.stringify(pod),pod.created]);
for (let i=0;i<14;i++) {
  await advancePod(pod.id,owner);
  const latest = await db().one("SELECT data FROM pods WHERE id=?", [pod.id]);
  const state = JSON.parse(String(latest!.data)) as Run;
  if (state.status === "Needs approval") {
    const completed = state.tasks.filter(task => task.status === "Completed").length;
    if (completed >= 5) break;
    const review = state.tasks.find(task => task.status === "Needs approval")!;
    await decideTask(state,review.id,"approve","Demo-only approval to exercise the simulated workflow; not a real diligence decision.",owner);
  } else if (state.status !== "Queued") break;
}
process.stdout.write(`Created ${demoName} and ${pod.name}: ${companyId} / ${pod.id}\n`);
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
