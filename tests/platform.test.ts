import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { defaultCompany, domains, interview, podQuestions, agents, processFor, type Business, type PodInput, type Run } from "../lib/workforce";
import { Database, db } from "../lib/server/db";
import { GET, POST, PUT, PATCH, DELETE } from "../app/api/[...path]/route";
import { advancePod } from "../lib/server/orchestrator";
import { podFor, savePod } from "../lib/server/repository";
import { hash, sendOtp, verifyOtp } from "../lib/server/auth";
import { validateMcpEndpoint } from "../lib/server/mcp";
import { integrationRegistry } from "../lib/integration-registry";

const dir = mkdtempSync(path.join(tmpdir(), "ai-pods-test-"));
process.env.DATABASE_URL = `file:${path.join(dir, "test.sqlite")}`;
process.env.ENABLE_DEMO_ADMIN = "true";
process.env.MAIL_MODE = "console";
delete process.env.RESEND_API_KEY;
delete process.env.APP_URL;
for (const cap of ["CHAT", "CODE", "IMAGE", "VIDEO", "EMBEDDING", "AUDIO", "VISION"]) for (const key of ["URL", "KEY", "NAME"]) delete process.env[`${cap}_MODEL_${key}`];
let cookie = "";
async function request(route: string, method = "GET", data?: unknown, auth = cookie, origin = "http://localhost:3000") {
  const res = await ({ GET, POST, PUT, PATCH, DELETE }[method]!) (new Request(`http://localhost:3000/api/${route}`, { method, headers: { cookie: auth, origin, ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }) }, body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data) }), { params: Promise.resolve({ path: route.split("?")[0].split("/") }) });
  return { status: res.status, data: res.headers.get("content-type")?.includes("application/json") ? await res.json() : await res.text(), cookie: res.headers.get("set-cookie")?.split(";")[0] || "" };
}
function fixture() {
  const c = defaultCompany(); Object.assign(c, { name: "Test Commerce", industry: "Retail", businessModel: "D2C", geography: "India", products: "Home products", about: "A retail business", metric: "Qualified orders", baseline: "100/month", target: "120/month", domains: ["marketing"], recommendedPods: ["marketing"], noExistingTools: true, processDocumentation: "Owner-approved process SOP", status: "active" });
  c.answers.marketing = Object.fromEntries([...interview, ...domains[0].questions].map(q => [q.id, `Confirmed ${q.id} requirements`]));
  c.processes.marketing = processFor("marketing", c.answers.marketing).slice(0, 2);
  c.processes.marketing[0].control = "Human only"; c.processes.marketing[1].control = "Human approves";
  return c;
}
const input: PodInput = { name: "Diwali campaign", objective: "Improve qualified orders with a Diwali campaign brief", domain: "marketing", answers: Object.fromEntries([...podQuestions, ...domains[0].questions].map(q => [q.id, `Confirmed ${q.id} for campaign`])), roleIds: [agents.find(a => a.name === "Marketing Agent")!.id], knowledgeIds: [], autonomy: 2, mode: "simulation", requested: ["chat"] };

test("integration catalog is structured and MCP endpoint registration rejects unsafe URLs", () => {
  assert.ok(integrationRegistry.length >= 70);
  assert.ok(integrationRegistry.every(entry => entry.id && entry.category && entry.mode));
  assert.throws(() => validateMcpEndpoint("http://example.com/mcp"));
  assert.throws(() => validateMcpEndpoint("https://localhost/mcp"));
  assert.throws(() => validateMcpEndpoint("https://127.0.0.1/mcp"));
  assert.throws(() => validateMcpEndpoint("https://user:secret@example.com/mcp"));
  assert.equal(validateMcpEndpoint("https://mcp.example.com/mcp").hostname,"mcp.example.com");
});

test("persistent workforce API and execution lifecycle", async t => {
  let company: Business; let owner = ""; let fileId = ""; let pod: Run; let otherCookie = "";
  try {
    await t.test("login, session cookie, unauthorized and origin checks", async () => {
      assert.equal((await request("state", "GET", undefined, "")).status, 401);
      assert.equal((await request("auth/login", "POST", { email: "admin", password: "wrong" })).status, 401);
      const r = await request("auth/login", "POST", { email: "admin", password: "admin" }); assert.equal(r.status, 200); cookie = r.cookie; assert.ok(cookie.startsWith("workforce_session="));
      const session = await request("auth/session"); owner = session.data.user.id;
      assert.equal((await request("controls", "POST", { killed: true }, cookie, "https://evil.example")).status, 403);
      process.env.ENABLE_DEMO_ADMIN = "false"; assert.equal((await request("state")).status, 401); process.env.ENABLE_DEMO_ADMIN = "true";
    });
    await t.test("registration, single-use OTP, hashing and second owner", async () => {
      let code = ""; const info = console.info; console.info = (...args) => { code = String(args[0]).match(/: (\d{6})$/)?.[1] || code; };
      try { assert.equal((await request("auth/register", "POST", { email: "owner@example.test", password: "test-password-123", name: "Owner two" })).status, 201); } finally { console.info = info; }
      assert.match(code, /^\d{6}$/);
      assert.equal((await request("auth/login", "POST", { email: "owner@example.test", password: "test-password-123" })).status, 403);
      assert.equal((await request("auth/verify", "POST", { email: "owner@example.test", code: "000000" })).status, 400);
      const r = await request("auth/verify", "POST", { email: "owner@example.test", code }); assert.equal(r.status, 200); otherCookie = r.cookie;
      assert.equal((await request("auth/verify", "POST", { email: "owner@example.test", code })).status, 400);
      const row = await db().one("SELECT password FROM users WHERE email=?", ["owner@example.test"]); assert.notEqual(row?.password, "test-password-123");
    });
    await t.test("OTP cooldown, expiry and five-attempt cap", async () => {
      const id = "pending-user"; await db().query("INSERT INTO users(id,email,name,password,created) VALUES(?,?,?,?,?)", [id, "pending@example.test", "Pending", "unused", new Date().toISOString()]);
      const info = console.info; console.info = () => {}; try { await sendOtp(id, "pending@example.test"); } finally { console.info = info; }
      await assert.rejects(sendOtp(id, "pending@example.test"), /60 seconds/);
      await db().query("UPDATE verification SET hash=? WHERE user_id=?", [hash(`${id}:123456`), id]);
      for (let i = 0; i < 5; i++) await assert.rejects(verifyOtp(id, "000000"));
      await assert.rejects(verifyOtp(id, "123456"), /attempt limit/);
      await db().query("UPDATE verification SET attempts=0,expires=? WHERE user_id=?", ["2000-01-01", id]);
      await assert.rejects(verifyOtp(id, "123456"), /expired/);
    });
    await t.test("onboarding validation, company ownership, concurrency and persistence", async () => {
      assert.equal((await request("companies", "POST", { ...defaultCompany(), name: "Incomplete", status: "active" })).status, 400);
      const r = await request("companies", "POST", fixture()); assert.equal(r.status, 200); company = r.data;
      assert.equal((await request(`companies/${company.id}/knowledge`, "GET", undefined, otherCookie)).status, 404);
      assert.equal((await request(`companies/${company.id}/research`, "GET", undefined, otherCookie)).status, 404);
      assert.equal((await request(`companies/${company.id}/research`, "POST", { website: "https://example.com" }, otherCookie)).status, 404);
      assert.equal((await request(`companies/${company.id}/research`)).data, null);
      assert.equal((await request(`companies/${company.id}/research`, "POST", { website: "http://127.0.0.1", mode: "free", render: false, maxPages: 5, extraUrls: [] })).status, 400);
      const updated = await request(`companies/${company.id}`, "PUT", { ...company, version: company.version }); assert.equal(updated.status, 200);
      assert.equal((await request(`companies/${company.id}`, "PUT", company)).status, 409); company = updated.data;
      const second = new Database(process.env.DATABASE_URL); assert.equal((await second.one("SELECT id FROM companies WHERE id=?", [company.id]))?.id, company.id); await second.close();
      assert.equal((await request("state", "GET", undefined, otherCookie)).data.companies.length, 0);
    });
    await t.test("MCP registration is company scoped and discovery starts with execution disabled", async () => {
      const catalog = await request("integrations?q=Salesforce", "GET", undefined, "");
      assert.equal(catalog.status, 200); assert.ok(catalog.data.integrations.some((entry: { name: string }) => entry.name === "Salesforce"));
      assert.equal((await request(`mcp/servers?companyId=${company.id}`, "GET", undefined, otherCookie)).status, 404);
      assert.equal((await request(`mcp/servers?companyId=${company.id}`, "POST", { name:"Private", endpoint:"http://127.0.0.1/mcp" })).status, 400);
      const added = await request(`mcp/servers?companyId=${company.id}`, "POST", { name:"Research MCP", endpoint:"https://mcp.example.com/mcp" });
      assert.equal(added.status, 201);
      const server = added.data.servers.find((item: { id: string }) => item.id === added.data.id);
      assert.equal(server.status, "DISCONNECTED"); assert.deepEqual(server.tools, []);
      assert.equal((await request(`mcp/servers?companyId=${company.id}`, "GET", undefined, otherCookie)).status, 404);
      assert.equal((await request(`mcp/servers/${server.id}/discover?companyId=wrong-company`, "POST", {})).status, 404);
      assert.equal((await request(`mcp/servers/${server.id}?companyId=${company.id}`, "DELETE", undefined, otherCookie)).status, 404);
      assert.equal((await request(`mcp/servers/${server.id}?companyId=${company.id}`, "DELETE")).status, 200);
      assert.deepEqual((await request(`mcp/servers?companyId=${company.id}`)).data.servers, []);
    });
    await t.test("real upload, indexing, download and cross-company evidence validation", async () => {
      const form = new FormData(); form.set("file", new File(["Campaign evidence: approved brand tone is warm and concise."], "brand.txt", { type: "text/plain" })); form.set("category", "Brand guidelines");
      const r = await request(`companies/${company.id}/knowledge`, "POST", form); assert.equal(r.status, 201); fileId = r.data[0].id; assert.equal(r.data[0].chunks, 1);
      assert.match((await request(`knowledge/${fileId}`)).data, /warm and concise/);
      assert.equal((await request(`knowledge/${fileId}`, "GET", undefined, otherCookie)).status, 404);
      assert.equal((await request(`companies/${company.id}/pods`, "POST", { ...input, knowledgeIds: ["another-company-file"] })).status, 400);
      const second = (await request("companies", "POST", { ...fixture(), name: "Separate company" })).data;
      assert.equal((await request(`companies/${second.id}/pods`, "POST", { ...input, knowledgeIds: [fileId] })).status, 400);
      assert.equal((await request(`companies/${company.id}/pods`, "POST", { ...input, answers: {} })).status, 400);
      const created = await request(`companies/${company.id}/pods`, "POST", { ...input, knowledgeIds: [fileId] }); assert.equal(created.status, 201); pod = created.data;
      assert.equal(pod.tasks[0].agentId, "pod-manager"); assert.equal(pod.tasks.at(-1)?.agentId, "orchestrator");
    });
    await t.test("registry search and pod membership share persisted agent IDs", async () => {
      const brand = agents.find(a => a.name === "Social Media Manager")!;
      const search = await request("agents?q=social", "GET", undefined, "");
      assert.equal(search.status, 200);
      assert.ok(search.data.agents.some((a: { id: string }) => a.id === brand.id));
      const financial = await request("agents?q=finance", "GET", undefined, "");
      assert.ok(financial.data.agents.some((a: { name: string }) => a.name === "Finance Agent"));
      assert.ok(financial.data.agents.some((a: { name: string }) => a.name === "Finance Agent"));
      assert.equal((await request(`agents/${brand.id}?companyId=${company.id}`, "GET", undefined, otherCookie)).status, 404);
      const added = await request(`pods/${pod.id}/agents`, "POST", { agentId: brand.id });
      assert.equal(added.status, 200); assert.ok(added.data.roleIds.includes(brand.id));
      assert.ok((await podFor(pod.id, owner)).roleIds.includes(brand.id));
      const status = await request(`agents/${brand.id}?companyId=${company.id}`);
      assert.deepEqual(status.data.deployedPodIds, [pod.id]);
      assert.equal((await request(`agents/${brand.id}`, "PATCH", { companyId: company.id, autonomyLevel: 1, manager: "Human owner" }, otherCookie)).status, 404);
      const configured = await request(`agents/${brand.id}`, "PATCH", { companyId: company.id, autonomyLevel: 1, manager: "Human owner" });
      assert.equal(configured.status, 200); assert.equal(configured.data.autonomyLevel, 1);
      assert.equal((await request(`agents/${brand.id}?companyId=${company.id}`)).data.manager, "Human owner");
      const removed = await request(`pods/${pod.id}/agents/${brand.id}`, "DELETE");
      assert.equal(removed.status, 200); assert.ok(!removed.data.roleIds.includes(brand.id));
    });
    await t.test("operations snapshot, task inspector and reassignment use saved pod state", async () => {
      const snapshot = await request(`operations?companyId=${company.id}`);
      assert.equal(snapshot.status, 200);
      assert.ok(snapshot.data.tasks.some((task: { podId: string }) => task.podId === pod.id));
      assert.equal(snapshot.data.health.running, 0);
      const controller = new AbortController();
      const streamResponse = await GET(new Request(`http://localhost:3000/api/operations/stream?companyId=${company.id}`, { headers: { cookie }, signal: controller.signal }), { params: Promise.resolve({ path: ["operations","stream"] }) });
      assert.equal(streamResponse.headers.get("content-type"), "text/event-stream; charset=utf-8");
      const reader = streamResponse.body!.getReader();
      const first = await reader.read();
      assert.match(new TextDecoder().decode(first.value), /event: update/);
      controller.abort(); await reader.cancel();
      pod = await podFor(pod.id, owner);
      const planned = pod.tasks.find(t => t.agentId !== "human" && t.agentId !== "pod-manager" && t.agentId !== "orchestrator")!;
      const detail = await request(`operations/tasks/${planned.id}?companyId=${company.id}&podId=${pod.id}`);
      assert.equal(detail.status, 200);
      assert.ok(detail.data.dependencyChain.some((item: { id: string }) => item.id === planned.id));
      assert.equal((await request(`operations?companyId=${company.id}`, "GET", undefined, otherCookie)).status, 404);
      const brand = agents.find(a => a.name === "Social Media Manager")!;
      await request(`pods/${pod.id}/agents`, "POST", { agentId: brand.id });
      const current = (await podFor(pod.id, owner)).tasks.find(t => t.agentId !== "human" && t.agentId !== "pod-manager" && t.agentId !== "orchestrator")!;
      const reassigned = await request(`operations/tasks/${current.id}/reassign?companyId=${company.id}`, "POST", { podId: pod.id, agentId: brand.id });
      assert.equal(reassigned.status, 200);
      assert.equal((await podFor(pod.id, owner)).tasks.find(t => t.id === current.id)?.agentId, brand.id);
      const history = await request(`operations/tasks/${current.id}?companyId=${company.id}&podId=${pod.id}`);
      assert.ok(history.data.activity.some((event: { type: string }) => event.type === "TASK_ASSIGNED"));
      await request(`pods/${pod.id}/agents/${brand.id}`, "DELETE");
    });
    await t.test("kill switch, dependent work, human gates and revision lifecycle", async () => {
      await request(`pods/${pod.id}/run`, "POST", {}); await request("controls", "POST", { killed: true }); await advancePod(pod.id, owner); assert.equal((await podFor(pod.id, owner)).tasks[0].status, "Planned");
      await request("controls", "POST", { killed: false }); await advancePod(pod.id, owner); await advancePod(pod.id, owner);
      pod = await podFor(pod.id, owner); assert.equal(pod.status, "Needs approval"); const human = pod.tasks[1]; assert.equal(human.control, "Human only");
      assert.equal((await request(`pods/${pod.id}/decision`, "POST", { taskId: human.id, decision: "approve", feedback: "" })).status, 400);
      assert.equal((await request(`pods/${pod.id}/decision`, "POST", { taskId: human.id, decision: "approve", feedback: "Campaign brief authorized" }, otherCookie)).status, 404);
      await request(`pods/${pod.id}/decision`, "POST", { taskId: human.id, decision: "approve", feedback: "Campaign brief authorized" }); await advancePod(pod.id, owner);
      pod = await podFor(pod.id, owner); const draft = pod.tasks[2]; assert.equal(draft.status, "Needs approval"); assert.match(draft.output, /warm and concise/);
      await request(`pods/${pod.id}/decision`, "POST", { taskId: draft.id, decision: "changes", feedback: "Clarify the offer" }); await advancePod(pod.id, owner);
      pod = await podFor(pod.id, owner); assert.equal(pod.tasks[2].revision, 2);
      await request(`pods/${pod.id}/decision`, "POST", { taskId: draft.id, decision: "approve", feedback: "Approved" }); await advancePod(pod.id, owner); await advancePod(pod.id, owner);
      pod = await podFor(pod.id, owner); assert.equal(pod.resultStatus, "simulation"); assert.match(pod.result, /not model-generated work/);
      await request(`pods/${pod.id}/decision`, "POST", { taskId: pod.tasks.at(-1)!.id, decision: "approve", feedback: "Configuration checked" });
      assert.equal((await podFor(pod.id, owner)).status, "Completed"); assert.match((await request(`pods/${pod.id}/download`)).data, /Simulation/);
    });
    await t.test("missing live models fail honestly; expired worker lease is recoverable", async () => {
      const r = await request(`companies/${company.id}/pods`, "POST", { ...input, mode: "live" }); const live = r.data as Run;
      await request(`pods/${live.id}/run`, "POST", {}); await advancePod(live.id, owner);
      let current = await podFor(live.id, owner); assert.equal(current.status, "Blocked"); assert.equal(current.result, ""); assert.match(current.events[0].text, /Configure chat/);
      current.status = "Running"; current.events = [{ who: "Worker lease", at: "2000-01-01", text: "Interrupted" }]; await savePod(current); await advancePod(live.id, owner);
      current = await podFor(live.id, owner); assert.equal(current.status, "Blocked"); assert.match(current.events[0].text, /lease expired/);
    });
    await t.test("live gateway contract and in-flight stop discard generated output", async () => {
      const originalFetch = globalThis.fetch; let release!: () => void; let started!: () => void; const begun = new Promise<void>(r => { started = r; });
      process.env.CHAT_MODEL_URL = "http://test-gateway.invalid/generate"; process.env.CHAT_MODEL_KEY = "test-only"; process.env.CHAT_MODEL_NAME = "contract-test";
      globalThis.fetch = async (_url, options) => { const payload = JSON.parse(String(options?.body)); assert.ok(payload.instructions.includes("permissions")); assert.ok(payload.context.company.name); started(); await new Promise<void>(r => { release = r; }); return Response.json({ text: "A real gateway response for contract verification" }); };
      try {
        const live = (await request(`companies/${company.id}/pods`, "POST", { ...input, mode: "live" })).data;
        await request(`pods/${live.id}/run`, "POST", {}); const job = advancePod(live.id, owner); await begun;
        await request(`pods/${live.id}/pause`, "POST", { paused: true }); release(); await job;
        const stopped = await podFor(live.id, owner); assert.equal(stopped.tasks[0].output, ""); assert.equal(stopped.paused, true);
        globalThis.fetch = async () => Response.json({ text: "Validated gateway draft with evidence" });
        await request(`pods/${live.id}/pause`, "POST", { paused: false }); await advancePod(live.id, owner);
        assert.equal((await podFor(live.id, owner)).tasks[0].output, "Validated gateway draft with evidence");
      } finally { globalThis.fetch = originalFetch; delete process.env.CHAT_MODEL_URL; delete process.env.CHAT_MODEL_KEY; delete process.env.CHAT_MODEL_NAME; }
    });
    await t.test("blueprint edits block old context; deletion cascades; logout invalidates session", async () => {
      const p = (await request(`companies/${company.id}/pods`, "POST", input)).data;
      await request(`companies/${company.id}`, "PUT", { ...company, about: "Updated company context" });
      await request(`pods/${p.id}/run`, "POST", {}); await advancePod(p.id, owner); assert.equal((await podFor(p.id, owner)).status, "Blocked");
      assert.equal((await request(`companies/${company.id}`, "DELETE", { confirmation: "incorrect" })).status, 400);
      assert.equal((await request(`companies/${company.id}`, "DELETE", { confirmation: company.name })).status, 200);
      assert.equal((await request(`knowledge/${fileId}`)).status, 404); assert.equal((await request(`pods/${pod.id}/download`)).status, 404);
      await request("auth/logout", "POST", {}); assert.equal((await request("state")).status, 401);
    });
  } finally { await db().close(); rmSync(dir, { recursive: true, force: true }); }
});

