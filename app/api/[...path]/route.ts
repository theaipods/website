import { randomUUID } from "node:crypto";
import { z } from "zod";
import { agentWithOperations, eligibleAgents, registryAgent, registryCategories, registryDefinitions, type AgentSettings } from "@/lib/agent-registry";
import { db } from "@/lib/server/db";
import { startAuthChallenge, verifyAuthChallenge, finishAuthChallenge } from "@/lib/server/auth-challenges";
import { getAboutContent, saveAboutContent } from "@/lib/server/about";
import { ApiError, hash, passwordMatches, rateLimit, requireAdmin, requireUser, seedAdmin, sessionCookie, sessionUser, requireCompanyEmail } from "@/lib/server/auth";
import { audit, companiesFor, companyFor, knowledgeFor, podFor, saveCompany, savePod } from "@/lib/server/repository";
import { buildRun, decideTask, event } from "@/lib/server/orchestrator";
import { providerStatus } from "@/lib/server/providers";
import { companyGaps, companySchema, podSchema, type Run } from "@/lib/workforce";
import { withOutcomes } from '@/lib/company-outcomes';
import { officeText } from "@/lib/server/extract";
import { enqueueResearch, latestResearchJob } from "@/lib/server/research-jobs";
import { eventRevision, operationsPods, operationsSnapshot, taskDetail } from "@/lib/server/operations";
import { integrationCategories, integrationRegistry } from "@/lib/integration-registry";
import { addMcpServer, listMcpServers, refreshMcpServer, validateMcpEndpoint } from "@/lib/server/mcp";
import { cancelDemoBooking, createDemoBooking, demoAvailability, getDemoBooking, recordDemoAnalytics, rescheduleDemoBooking } from "@/lib/server/demo-booking";
import { recommendDemoWorkforce } from "@/lib/demo-recommendation";
import { adminEventCatalog, cancelEventRegistration, eventMetric, getEvent, getEventRegistration, listEvents, registerForEvent, saveAdminEvent, saveAdminSpeaker } from "@/lib/server/events";
import { eventStatuses, eventTypes, type EventSpeaker, type PodEvent } from "@/lib/events";
import { accountPlan, insertProjectPod } from "@/lib/server/plans";
import { buildDemoProject } from "@/lib/server/demo-projects";
import { addProfileServer, discoverProfileServer, grantProfileTool, importProfileTool, profileServers, removeProfileServer } from "@/lib/server/profile-mcp";
import { demoTemplates } from "@/lib/demo-templates";
import { suggestOnboarding, prepareTrial } from "@/lib/server/onboarding-assistance";
import { sendContactInterest } from "@/lib/server/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
async function body(req: Request) { const raw = await req.text(); if (raw.length > 1500000) throw new ApiError(413, "Request too large."); try { return JSON.parse(raw); } catch { throw new ApiError(400, "Invalid JSON request."); } }
const emailSchema = z.string().trim().toLowerCase().email().max(254);
const eventDataSchema=z.object({id:z.string().min(3).max(100),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),title:z.string().trim().min(5).max(240),subtitle:z.string().max(500),description:z.string().min(10).max(8000),type:z.enum(eventTypes),status:z.enum(eventStatuses),startAt:z.string().datetime(),endAt:z.string().datetime(),timezone:z.string().min(1).max(100),duration:z.number().int().min(1).max(1440),format:z.enum(["Virtual","In Person","Hybrid","On Demand"]),location:z.string().max(300),virtualUrl:z.union([z.literal(""),z.url()]),registrationUrl:z.union([z.literal(""),z.url()]),recordingUrl:z.union([z.literal(""),z.url()]),thumbnail:z.string().max(500),heroVisual:z.string().max(120),speakerIds:z.array(z.string().max(100)).max(20),topics:z.array(z.string().max(100)).max(30),industries:z.array(z.string().max(100)).max(30),tags:z.array(z.string().max(100)).max(30),agenda:z.array(z.object({time:z.string().max(40),title:z.string().max(200),description:z.string().max(1000)})).max(50),learn:z.array(z.string().max(500)).max(30),audience:z.array(z.string().max(500)).max(30),relatedAgents:z.array(z.string().max(120)).max(30),integrations:z.array(z.string().max(120)).max(30),featured:z.boolean(),visibility:z.enum(["PUBLIC","PRIVATE"]),capacity:z.number().int().positive().nullable(),registrationCount:z.number().int().nonnegative().nullable(),createdAt:z.string().datetime(),updatedAt:z.string().datetime(),sample:z.boolean()}).refine(value=>new Date(value.endAt)>new Date(value.startAt),"End time must be after start time.");
const speakerDataSchema=z.object({id:z.string().min(3).max(100),name:z.string().trim().min(2).max(160),role:z.string().max(160),company:z.string().max(160),bio:z.string().max(3000),photo:z.string().max(500),linkedin:z.union([z.literal(""),z.url()]),expertise:z.array(z.string().max(120)).max(30),sample:z.boolean()});
async function registryPods(companyId: string, ownerId: string): Promise<Run[]> {
  await companyFor(companyId, ownerId);
  const rows = await db().all("SELECT data FROM pods WHERE company_id=? ORDER BY created DESC", [companyId]);
  return rows.map(row => JSON.parse(String(row.data)) as Run);
}
async function agentLimits(companyId: string): Promise<Record<string, number>> {
  const rows = await db().all("SELECT agent_id,autonomy FROM agent_settings WHERE company_id=?", [companyId]);
  return Object.fromEntries(rows.map(row => [String(row.agent_id), Number(row.autonomy)]));
}
async function handle(req: Request, ctx: Context): Promise<Response> {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      const origin = req.headers.get("origin");
      const expected = process.env.APP_URL || new URL(req.url).origin;
      if (origin && origin !== expected) throw new ApiError(403, "Cross-origin requests are not allowed.");
      if (req.headers.get("sec-fetch-site") === "cross-site") throw new ApiError(403, "Cross-site request denied.");
    }
    const parts = (await ctx.params).path;
    const route = parts.join("/");
    const method = req.method;
    await seedAdmin();
    if (route === "contact/interest" && method === "POST") {
      const input = z.object({ email: emailSchema, website: z.string().max(200).default("") }).parse(await body(req));
      if (input.website) return json({ ok: true }, 201);
      const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      await rateLimit(`contact-interest-ip:${forwarded}`, 8, 3600000);
      await rateLimit(`contact-interest-email:${input.email}`, 3, 3600000);
      await sendContactInterest(input);
      return json({ ok: true }, 201);
    }
    if (route === "events" && method === "GET") {
      const url=new URL(req.url);return json(await listEvents(Object.fromEntries(["q","period","category","industry","format","location","topic","speaker","sort","year"].map(key=>[key,url.searchParams.get(key)||""]))));
    }
    if (parts[0] === "events" && parts[1] && parts[2] === "calendar" && method === "GET") {const {event}=await getEvent(parts[1]);const stamp=(value:string)=>new Date(value).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");const esc=(value:string)=>value.replace(/\\/g,"\\\\").replace(/,/g,"\\,").replace(/;/g,"\\;").replace(/\n/g,"\\n");const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//AI Pod//Events//EN","BEGIN:VEVENT",`UID:${event.id}@theaipods`, `DTSTAMP:${stamp(new Date().toISOString())}`,`DTSTART:${stamp(event.startAt)}`,`DTEND:${stamp(event.endAt)}`,`SUMMARY:${esc(event.title)}`,`DESCRIPTION:${esc(event.description)}`,`LOCATION:${esc(event.location)}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");return new Response(ics,{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":`attachment; filename=\"${event.slug}.ics\"`}});}
    if (parts[0] === "events" && parts[1] && parts.length === 2 && method === "GET") return json(await getEvent(parts[1]));
    if (route === "events/register" && method === "POST") {
      const input=z.object({eventId:z.string().min(1).max(100),firstName:z.string().trim().min(1).max(80),lastName:z.string().trim().min(1).max(80),email:emailSchema,company:z.string().trim().min(1).max(160),jobTitle:z.string().trim().min(1).max(120),companySize:z.string().trim().min(1).max(80),industry:z.string().trim().min(1).max(120),interests:z.array(z.string().max(120)).max(20).default([]),notes:z.string().max(3000).default(""),source:z.string().max(120).optional(),utmSource:z.string().max(120).optional(),utmMedium:z.string().max(120).optional(),utmCampaign:z.string().max(120).optional()}).parse(await body(req));
      await rateLimit(`event-registration:${input.email}`,8,3600000);return json(await registerForEvent(input),201);
    }
    if (parts[0] === "events" && parts[1] === "registrations" && parts[2] && parts.length===3 && method === "GET") return json(await getEventRegistration(parts[2],new URL(req.url).searchParams.get("token")||""));
    if (parts[0] === "events" && parts[1] === "registrations" && parts[2] && parts[3] === "cancel" && method === "POST") {const input=z.object({manageToken:z.string().min(20)}).parse(await body(req));return json(await cancelEventRegistration(parts[2],input.manageToken));}
    if (route === "events/analytics" && method === "POST") {const input=z.object({event:z.string().max(80),path:z.string().max(200).default("/events"),detail:z.record(z.string(),z.string().max(120)).default({})}).parse(await body(req));await rateLimit("event-analytics",240,60000);await eventMetric(input.event,input.path,input.detail);return json({ok:true},201);}
    if (route === "demo/availability" && method === "GET") {
      const url=new URL(req.url);const month=url.searchParams.get("month")||new Date().toISOString().slice(0,7);const timezone=url.searchParams.get("timezone")||"UTC";
      return json(await demoAvailability(month,timezone));
    }
    if (route === "demo/recommendations" && method === "POST") {
      const input=z.object({industry:z.string().max(120),companySize:z.string().max(80),primaryGoal:z.string().max(2000),currentTools:z.array(z.string().max(120)).max(30),areasOfInterest:z.array(z.string().max(120)).max(20)}).parse(await body(req));
      return json(recommendDemoWorkforce(input));
    }
    if (route === "demo/bookings" && method === "POST") {
      const input=z.object({firstName:z.string().trim().min(1).max(80),lastName:z.string().trim().min(1).max(80),email:emailSchema,company:z.string().trim().min(1).max(160),jobTitle:z.string().trim().min(1).max(120),industry:z.string().trim().min(1).max(120),companySize:z.string().trim().min(1).max(80),primaryGoal:z.string().trim().min(10).max(3000),currentTools:z.array(z.string().max(120)).max(30),areasOfInterest:z.array(z.string().max(120)).min(1).max(20),additionalContext:z.string().max(5000),scheduledAt:z.string().datetime(),timezone:z.string().min(1).max(100),duration:z.number().int().min(15).max(120),meetingType:z.string().max(80).default("Video meeting"),source:z.string().max(120).optional(),campaign:z.string().max(120).optional(),utm:z.record(z.string(),z.string().max(200)).optional(),referrer:z.string().max(500).optional()}).parse(await body(req));
      await rateLimit(`demo-booking:${input.email}`,5,3600000);return json(await createDemoBooking(input),201);
    }
    if (parts[0] === "demo" && parts[1] === "bookings" && parts[2]) {
      if(method==="GET")return json(await getDemoBooking(parts[2],new URL(req.url).searchParams.get("token")||""));
      if(method==="POST"&&parts[3]==="cancel"){const input=z.object({manageToken:z.string().min(20)}).parse(await body(req));return json(await cancelDemoBooking(parts[2],input.manageToken));}
      if(method==="POST"&&parts[3]==="reschedule"){const input=z.object({manageToken:z.string().min(20),scheduledAt:z.string().datetime(),timezone:z.string().min(1).max(100)}).parse(await body(req));return json(await rescheduleDemoBooking(parts[2],input.manageToken,input.scheduledAt,input.timezone));}
    }
    if (route === "demo/events" && method === "POST") {
      const input=z.object({event:z.string().max(80),path:z.string().max(200).default("/book-demo"),detail:z.record(z.string(),z.string().max(120)).default({})}).parse(await body(req));
      await rateLimit("demo-analytics",200,60000);await recordDemoAnalytics(input.event,input.path,input.detail);return json({ok:true},201);
    }
    if (parts[0] === "integrations" && method === "GET") {
      const url = new URL(req.url);
      const query = (url.searchParams.get("q") || "").trim().toLowerCase();
      const category = url.searchParams.get("category") || "All";
      return json({ categories: integrationCategories, integrations: integrationRegistry.filter(item => (category === "All" || item.category === category) && (!query || `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query))) });
    }
    if (parts[0] === "agents" && method === "GET") {
      const url = new URL(req.url);
      const companyId = url.searchParams.get("companyId");
      const pods = companyId ? await registryPods(companyId, (await requireUser(req)).id) : [];
      const settingRows = companyId ? await db().all("SELECT agent_id,autonomy,manager,updated FROM agent_settings WHERE company_id=?", [companyId]) : [];
      const settings = new Map(settingRows.map(row => [String(row.agent_id), { autonomyLevel: Number(row.autonomy), manager: String(row.manager), updatedAt: String(row.updated) } satisfies AgentSettings]));
      const all = registryDefinitions.map(a => agentWithOperations(a, pods, settings.get(a.id)));
      if (parts[1] === "categories") return json(registryCategories);
      if (parts.length === 1) {
        const q = (url.searchParams.get("q") || "").trim().toLowerCase();
        const category = url.searchParams.get("category") || "";
        const status = url.searchParams.get("status") || "";
        const autonomy = Number(url.searchParams.get("autonomy") || 0);
        const risk = url.searchParams.get("risk") || "";
        const tool = (url.searchParams.get("tool") || "").toLowerCase();
        const approval = url.searchParams.get("approval") || "";
        const deployment = url.searchParams.get("deployment") || "";
        return json({ categories: registryCategories, compatibleSystems: [...new Set(registryDefinitions.flatMap(a => a.compatibleSystems))].sort(), agents: all.filter(a =>
          (url.searchParams.get("includeSystem") === "1" || a.category !== "platform") &&
          (!category || a.category === category) && (!status || a.status === status) &&
          (!autonomy || a.autonomyLevel === autonomy) && (!risk || a.riskLevel === risk) &&
          (!tool || [...a.tools,...a.compatibleSystems].some(t => t.toLowerCase().includes(tool))) &&
          (!approval || String(a.requiresApproval) === approval) &&
          (!deployment || (deployment === "deployed") === !!a.deployedPodIds.length) &&
          (!q || `${a.name} ${a.role} ${a.category} ${a.description} ${a.capabilities.join(" ")} ${a.skills.join(" ")} ${a.tools.join(" ")} ${a.compatibleSystems.join(" ")}`.toLowerCase().includes(q))
        ) });
      }
      const agent = all.find(a => a.id === parts[1]);
      if (!agent) throw new ApiError(404, "Agent not found.");
      if (parts[2] === "activity") {
        if (!companyId) throw new ApiError(400, "Choose a company to view activity.");
        return json(pods.filter(p => p.roleIds.includes(agent.id)).flatMap(p => p.events.filter(e => e.who === agent.name).map(e => ({ ...e, podId: p.id, podName: p.name }))).sort((a,b) => b.at.localeCompare(a.at)).slice(0, 50));
      }
      if (parts[2] === "metrics") return json(agent.metrics);
      return json(agent);
    }
    if (route === "site" && method === "GET") {
      const setting = await db().one("SELECT value FROM site_settings WHERE key='show_team'");
      return json({ showTeam: setting?.value === "true" });
    }
    if (route === "auth/session" && method === "GET") return json({ user: await sessionUser(req), demo: false });
    if (route === "auth/login" && method === "POST") {
      const input = z.object({ email: z.string().min(1).max(254), password: z.string().min(1).max(128), portal: z.enum(["owner", "admin"]).default("owner") }).parse(await body(req));
      const email = input.email.trim().toLowerCase();
      requireCompanyEmail(email);
      await rateLimit(`login:${email}`);
      const row = await db().one("SELECT * FROM users WHERE email=?", [email]);
      if (!row || email === "admin@local.test" || !passwordMatches(input.password, String(row.password))) throw new ApiError(401, "Email or password is incorrect.");
      if (!row.verified) throw new ApiError(403, "Verify your email using Create account to finish setup.");
      if (input.portal === "admin" && !(await db().one("SELECT user_id FROM admins WHERE user_id=?", [String(row.id)]))) throw new ApiError(403, "This account does not have admin access.");
      return json({ ok: true }, 200, { "Set-Cookie": await sessionCookie(String(row.id), String(row.password)) });
    }
    if (["auth/register", "auth/password-reset", "auth/resend", "auth/verify", "auth/complete-signup", "auth/reset-password"].includes(route) && method === "POST") {
      // The trusted reverse proxy must replace (not append untrusted) client-IP headers.
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      await rateLimit(`auth-flow-ip:${ip}`, 40, 900000);
      const payload = await body(req);
      if (["auth/register", "auth/password-reset", "auth/resend"].includes(route)) {
        const input = z.object({ email: emailSchema, purpose: z.enum(["signup", "reset"]).default("signup") }).parse(payload);
        const purpose = route === "auth/password-reset" ? "reset" : route === "auth/register" ? "signup" : input.purpose;
        return json(await startAuthChallenge(input.email, purpose));
      }
      if (route === "auth/verify") {
        const input = z.object({ email: emailSchema, purpose: z.enum(["signup", "reset"]), challengeId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) }).parse(payload);
        return json(await verifyAuthChallenge(input.email, input.purpose, input.challengeId, input.code));
      }
      const input = z.object({ email: emailSchema, grant: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(10).max(128), name: z.string().trim().min(1).max(120).optional() }).parse(payload);
      const purpose = route === "auth/reset-password" ? "reset" : "signup";
      const id = await finishAuthChallenge(input.email, purpose, input.grant, input.password, input.name);
      if (purpose === "reset") return json({ ok: true, message: "Password changed. Please log in with your new password." }, 200, { "Set-Cookie": "workforce_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" });
      return json({ ok: true }, 201, { "Set-Cookie": await sessionCookie(id) });
    }
    if (route === "auth/logout" && method === "POST") {
      const token = req.headers.get("cookie")?.split(";").map(x => x.trim()).find(x => x.startsWith("workforce_session="))?.slice(18);
      if (token) await db().query("DELETE FROM sessions WHERE token=?", [hash(token)]);
      return json({ ok: true }, 200, { "Set-Cookie": "workforce_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" });
    }
    const user = await requireUser(req);
    if (parts[0] === "profile-mcp") {
      if (method === "GET" && parts.length === 1) return json({ servers: await profileServers(user.id) });
      await rateLimit(`profile-mcp:${user.id}`, 60, 3600000);
      if (method === "POST" && parts.length === 1) {
        const input = z.object({name:z.string().trim().min(2).max(80),endpoint:z.string().url().max(500),token:z.string().max(8000).default("")}).parse(await body(req));
        return json({id:await addProfileServer(user.id,input.name,input.endpoint,input.token)},201);
      }
      if (method === "DELETE" && parts.length === 2) { await removeProfileServer(user.id,parts[1]); return json({ok:true}); }
      if (method === "POST" && parts[2] === "discover") { await discoverProfileServer(user.id,parts[1]); return json({ok:true}); }
      if (method === "POST" && parts[2] === "grant") {
        const input=z.object({name:z.string(),enabled:z.boolean()}).parse(await body(req)); await grantProfileTool(user.id,parts[1],input.name,input.enabled); return json({ok:true});
      }
      if (method === "POST" && parts[2] === "read") {
        const input=z.object({companyId:z.string(),name:z.string(),arguments:z.record(z.string(),z.unknown())}).parse(await body(req));
        return json(await importProfileTool(user.id,input.companyId,parts[1],input.name,input.arguments));
      }
      throw new ApiError(404,"Unknown profile MCP operation.");
    }
    if (route === "demo-projects" && method === "GET") return json({ templates: demoTemplates, plan: await accountPlan(user.id) });
    if (route === "demo-projects" && method === "POST") {
      const input = z.object({ requestKey: z.string().uuid().optional(), companyId: z.string(), templateId: z.string(), prompt: z.string().trim().min(20).max(12000), mode: z.enum(["live", "simulation"]), approvalMode: z.enum(["manual", "smart", "auto"]), knowledgeIds: z.array(z.string()).max(100).default([]) }).parse(await body(req));
      const company = await companyFor(input.companyId, user.id);
      const available = await knowledgeFor(company.id);
      const gaps = companyGaps(company, available.filter(k => k.category === "SOPs").length);
      if (gaps.length) throw new ApiError(400, `Complete onboarding before sending a demo brief: ${gaps.join("; ")}`);
      if (input.knowledgeIds.some(id => !available.some(k => k.id === id))) throw new ApiError(400, "Evidence must belong to the selected company.");
      if (input.mode === "live") {
        const required = input.templateId === "development-build" ? ["chat", "code"] : ["chat"];
        const missing = providerStatus().filter(p => required.includes(p.capability) && !p.configured);
        if (missing.length) throw new ApiError(400, `Configure ${missing.map(p => p.capability).join(" and ")} models in your environment before sending. No project has been created.`);
      }
      const pod = await insertProjectPod(user.id, buildDemoProject(company, input.templateId, input.prompt, input.mode, input.approvalMode, input.knowledgeIds),input.requestKey);
      await audit(user.id, company.id, `Sent demo project ${pod.name}; approval policy ${pod.approvalMode}`);
      return json(pod, 201);
    }
    if (parts[0] === "mcp" && parts[1] === "servers") {
      const companyId = new URL(req.url).searchParams.get("companyId") || "";
      if (!companyId) throw new ApiError(400, "Choose a company.");
      await companyFor(companyId, user.id);
      const servers = await listMcpServers(companyId);
      if (method === "GET" && parts.length === 2) return json({ servers });
      if (method === "POST" && parts.length === 2) {
        await rateLimit(`mcp-add:${user.id}`, 10, 3600000);
        if (servers.length >= 20) throw new ApiError(400, "This company has reached the 20 server limit.");
        const input = z.object({ name: z.string().trim().min(2).max(80), endpoint: z.string().url().max(500) }).parse(await body(req));
        try { validateMcpEndpoint(input.endpoint); } catch (error) { throw new ApiError(400, (error as Error).message); }
        const id = await addMcpServer(companyId,input.name,input.endpoint); await audit(user.id,companyId,`Registered MCP server ${input.name}`);
        return json({ id, servers: await listMcpServers(companyId) },201);
      }
      if (method === "POST" && parts[2] && parts[3] === "discover") {
        await rateLimit(`mcp-discover:${user.id}`, 15, 3600000);
        const server = servers.find(item => item.id === parts[2]); if (!server) throw new ApiError(404, "MCP server not found in this company.");
        await refreshMcpServer(companyId,server.id,server.endpoint); await audit(user.id,companyId,`Discovered MCP tools for ${server.name}`);
        return json({ server: (await listMcpServers(companyId)).find(item => item.id === server.id) });
      }
      if (method === "DELETE" && parts[2] && parts.length === 3) {
        const server = servers.find(item => item.id === parts[2]); if (!server) throw new ApiError(404, "MCP server not found in this company.");
        await db().query("DELETE FROM mcp_servers WHERE id=? AND company_id=?", [server.id,companyId]);
        await audit(user.id,companyId,`Removed MCP server ${server.name}`);
        return json({ ok:true });
      }
      throw new ApiError(404, "MCP endpoint not found.");
    }
    if (parts[0] === "operations") {
      const url = new URL(req.url);
      const companyId = url.searchParams.get("companyId") || "";
      if (!companyId) throw new ApiError(400, "Choose a company.");
      const pods = await operationsPods(companyId, user.id);
      if (method === "GET" && parts[1] === "stream") {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            let previous = ""; let lastHeartbeat = 0;
            try {
              while (!req.signal.aborted) {
                const current = eventRevision(await operationsPods(companyId, user.id));
                if (current !== previous) { controller.enqueue(encoder.encode(`event: update\ndata: ${JSON.stringify({ revision: current })}\n\n`)); previous = current; }
                else if (Date.now() - lastHeartbeat > 15000) { controller.enqueue(encoder.encode(`: heartbeat\n\n`)); lastHeartbeat = Date.now(); }
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } catch { /* A disconnected client or closed connection ends the stream. */ }
            try { controller.close(); } catch {}
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive", "X-Accel-Buffering": "no" } });
      }
      if (method === "GET" && parts[1] === "tasks" && parts[2]) {
        const pod = pods.find(p => p.id === url.searchParams.get("podId"));
        const task = pod?.tasks.find(t => t.id === parts[2]);
        if (!pod || !task) throw new ApiError(404, "Task not found in this company.");
        return json(taskDetail(pod, task));
      }
      if (method === "GET" && parts.length === 1) return json(operationsSnapshot(pods, { podId: url.searchParams.get("podId") || undefined, status: url.searchParams.get("status") || undefined, agentId: url.searchParams.get("agentId") || undefined, q: url.searchParams.get("q") || undefined, limit: Number(url.searchParams.get("limit") || 50), offset: Number(url.searchParams.get("offset") || 0) }));
      if (method === "POST" && parts[1] === "tasks" && parts[2] && parts[3] === "reassign") {
        const input = z.object({ podId: z.string(), agentId: z.string() }).parse(await body(req));
        const pod = pods.find(p => p.id === input.podId);
        const task = pod?.tasks.find(t => t.id === parts[2]);
        if (!pod || !task) throw new ApiError(404, "Task not found in this company.");
        if (!["Ready", "Queued", "Blocked"].includes(pod.status) || !["Planned", "Blocked"].includes(task.status)) throw new ApiError(409, "Only work that has not started can be reassigned.");
        if (!pod.roleIds.includes(input.agentId) || !registryAgent(input.agentId)) throw new ApiError(400, "Choose a specialist already assigned to this pod.");
        const agent = registryAgent(input.agentId)!;
        if (!eligibleAgents([agent.id], task.title, (await companyFor(companyId, user.id)).permissions).length) throw new ApiError(403, "Company permissions do not allow this specialist to perform the task.");
        task.agentId = input.agentId; task.status = "Planned"; task.progress = 0;
        event(pod, "Owner", `Assigned ${task.title} to ${agent.name}.`, "TASK_ASSIGNED", task.id, agent.id);
        await audit(user.id, companyId, `Reassigned task ${task.id} to ${agent.name}`);
        return json(await savePod(pod));
      }
      throw new ApiError(404, "Operations endpoint not found.");
    }
    if (parts[0] === "agents" && parts[1] && method === "PATCH") {
      const agent = registryAgent(parts[1]);
      if (!agent) throw new ApiError(404, "Agent not found.");
      const input = z.object({ companyId: z.string(), autonomyLevel: z.number().int().min(1).max(4), manager: z.enum(["Pod Manager", "Workforce Orchestrator", "Human owner"]) }).parse(await body(req));
      await companyFor(input.companyId, user.id);
      const now = new Date().toISOString();
      await db().query("INSERT INTO agent_settings(company_id,agent_id,autonomy,manager,updated) VALUES(?,?,?,?,?) ON CONFLICT(company_id,agent_id) DO UPDATE SET autonomy=excluded.autonomy,manager=excluded.manager,updated=excluded.updated", [input.companyId, agent.id, input.autonomyLevel, input.manager, now]);
      const company = await companyFor(input.companyId, user.id);
      const limits = await agentLimits(input.companyId);
      for (const pod of await registryPods(input.companyId, user.id)) if (pod.roleIds.includes(agent.id) && ["Ready", "Blocked"].includes(pod.status) && pod.tasks.every(t => t.status === "Planned")) {
        const planned = buildRun(company, { name: pod.name, objective: pod.objective, domain: pod.domain, answers: pod.answers, roleIds: pod.roleIds, knowledgeIds: pod.knowledgeIds, autonomy: pod.autonomy, mode: pod.mode, requested: pod.requested }, limits);
        pod.tasks = planned.tasks; event(pod, "Owner", `Updated ${agent.name} configuration and refreshed the plan.`); await savePod(pod);
      }
      await audit(user.id, input.companyId, `Configured ${agent.name}: autonomy L${input.autonomyLevel}, manager ${input.manager}`);
      return json(agentWithOperations(agent, await registryPods(input.companyId, user.id), { autonomyLevel: input.autonomyLevel, manager: input.manager, updatedAt: now }));
    }
    if (parts[0] === "admin") {
      await requireAdmin(req);
      if (route === "admin/plans" && method === "POST") {
        const input = z.object({ email: emailSchema, plan: z.enum(["starter", "founders", "enterprise"]) }).parse(await body(req));
        const account = await db().one("SELECT id FROM users WHERE email=? AND verified=1", [input.email]);
        if (!account) throw new ApiError(404, "Verified account not found.");
        await db().query("INSERT INTO account_plans(user_id,plan,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET plan=excluded.plan,updated=excluded.updated", [String(account.id), input.plan, new Date().toISOString()]);
        await audit(user.id, null, `Assigned ${input.plan} plan to ${input.email}`);
        return json(await accountPlan(String(account.id)));
      }
      if (route === "admin/about" && method === "GET") return json(await getAboutContent());
      if (route === "admin/about" && method === "POST") { const saved = await saveAboutContent(await body(req)); await audit(user.id, null, "Updated About page content"); return json(saved); }
      if(route==="admin/events"&&method==="GET")return json(await adminEventCatalog());
      if(route==="admin/events"&&method==="POST"){const input=eventDataSchema.parse(await body(req)) as PodEvent;const saved=await saveAdminEvent(input);await audit(user.id,null,`Saved event ${saved.slug}`);return json(saved,201);}
      if(route==="admin/events/speakers"&&method==="POST"){const input=speakerDataSchema.parse(await body(req)) as EventSpeaker;const saved=await saveAdminSpeaker(input);await audit(user.id,null,`Saved event speaker ${saved.id}`);return json(saved,201);}
      if (route === "admin/overview" && method === "GET") {
        const users = await db().all("SELECT u.id,u.name,u.email,u.verified,u.created,CASE WHEN a.user_id IS NULL THEN 'owner' ELSE 'admin' END AS role FROM users u LEFT JOIN admins a ON a.user_id=u.id ORDER BY u.created DESC");
        const companies = await db().all("SELECT c.id,c.owner_id,c.data,c.created,u.name AS owner_name,u.email AS owner_email FROM companies c JOIN users u ON u.id=c.owner_id ORDER BY c.created DESC");
        const pods = await db().all("SELECT p.id,p.company_id,p.data,p.created,c.owner_id FROM pods p JOIN companies c ON c.id=p.company_id ORDER BY p.created DESC");
        const knowledge = await db().all("SELECT k.id,k.company_id,k.name,k.category,k.status,k.created FROM knowledge k ORDER BY k.created DESC");
        return json({ users, companies: companies.map(c => ({ id: c.id, ownerId: c.owner_id, ownerName: c.owner_name, ownerEmail: c.owner_email, created: c.created, ...JSON.parse(String(c.data)) })),
          pods: pods.map(p => ({ id: p.id, companyId: p.company_id, ownerId: p.owner_id, created: p.created, ...JSON.parse(String(p.data)) })), knowledge });
      }
      if (route === "admin/settings") {
        if (method === "GET") { const row = await db().one("SELECT value FROM site_settings WHERE key='show_team'"); return json({ showTeam: row?.value === "true" }); }
        if (method === "POST") {
          const input = z.object({ showTeam: z.boolean() }).parse(await body(req));
          await db().query("INSERT INTO site_settings(key,value) VALUES('show_team',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [String(input.showTeam)]);
          await audit(user.id, null, `${input.showTeam ? "Showed" : "Hid"} team on homepage`);
          return json({ showTeam: input.showTeam });
        }
      }
      if (route === "admin/users" && method === "POST") {
        const input = z.object({ email: emailSchema }).parse(await body(req));
        const account = await db().one("SELECT id,verified FROM users WHERE email=?", [input.email]);
        if (!account || !account.verified) throw new ApiError(404, "Ask this person to create and verify an account first.");
        await db().query("INSERT INTO admins(user_id,granted_by,created) VALUES(?,?,?) ON CONFLICT(user_id) DO NOTHING", [String(account.id), user.id, new Date().toISOString()]);
        await audit(user.id, null, `Granted admin access to ${input.email}`);
        return json({ ok: true });
      }
      if (parts[1] === "users" && parts[2] && method === "DELETE") {
        if (parts[2] === user.id) throw new ApiError(400, "You cannot remove your own admin access.");
        const count = await db().one("SELECT COUNT(*) AS n FROM admins");
        if (Number(count?.n) <= 1) throw new ApiError(400, "At least one admin is required.");
        await db().query("DELETE FROM admins WHERE user_id=?", [parts[2]]);
        await audit(user.id, null, `Removed admin access from ${parts[2]}`);
        return json({ ok: true });
      }
      throw new ApiError(404, "Admin endpoint not found.");
    }
    if (route === "state" && method === "GET") {
      const companies = await companiesFor(user.id);
      const rows = await db().all("SELECT p.* FROM pods p JOIN companies c ON c.id=p.company_id WHERE c.owner_id=? ORDER BY p.created DESC", [user.id]);
      const control = await db().one("SELECT killed FROM controls WHERE user_id=?", [user.id]);
      return json({ user, companies, pods: rows.map(r => ({ ...JSON.parse(String(r.data)), version: Number(r.version) })), killed: !!control?.killed, providers: providerStatus(), audit: await db().all("SELECT action,at,company_id FROM audit WHERE user_id=? ORDER BY at DESC LIMIT 100", [user.id]) });
    }
    if (route === "controls" && method === "POST") {
      const { killed } = z.object({ killed: z.boolean() }).parse(await body(req));
      await db().query("INSERT INTO controls(user_id,killed) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET killed=excluded.killed", [user.id, killed ? 1 : 0]);
      await audit(user.id, null, killed ? "Stopped all pods" : "Resumed workforce"); return json({ killed });
    }
    if (parts[0] === "companies") {
      const id = parts[1];
      if (method === "POST" && parts.length === 1 || method === "PUT" && parts.length === 2) {
        const raw = await body(req); const parsed = companySchema.parse(raw);
        const input = parsed.outcomes === undefined ? parsed : withOutcomes(parsed, parsed.outcomes);
        const documents = id ? (await knowledgeFor((await companyFor(id, user.id)).id)).filter(k => k.category === "SOPs").length : 0;
        const gaps = input.status === "active" ? companyGaps(input, documents) : [];
        if (gaps.length) throw new ApiError(400, `Complete onboarding: ${gaps.join("; ")}`);
        return json(await saveCompany(user.id, input, id, raw.version));
      }
      const company = await companyFor(id, user.id);
      if (parts[2] === 'quickstart' && parts.length === 3 && method === 'POST') {
        await rateLimit(`onboarding-quickstart:${user.id}`, 6, 3600000);
        const result=await prepareTrial(id,await body(req));
        await audit(user.id,id,'Prepared trial onboarding and local process check; no external actions');
        return json(result);
      }
      if (parts[2] === "assist" && parts.length === 3 && method === "POST") {
        await rateLimit(`onboarding-assist:${user.id}`, 60, 3600000);
        const result = await suggestOnboarding(id, await body(req));
        await audit(user.id, id, `Generated ${result.suggestions.length} onboarding suggestions for review`);
        return json(result);
      }
      if (parts[2] === "research") {
        if (method === "GET" && parts[3] === "status") return json(await latestResearchJob(id));
        if (method === "GET") { const row = await db().one("SELECT blob FROM knowledge WHERE company_id=? AND category='Website research' ORDER BY created DESC LIMIT 1", [id]); return json(row ? JSON.parse(Buffer.from(String(row.blob), 'base64').toString()) : null); }
        if (method === "POST") {
          await rateLimit(`research:${user.id}`, 5, 3600000);
          const input = z.object({ website: z.string().min(3).max(2000), extraUrls: z.array(z.string().max(2000)).max(10).default([]), render: z.boolean().default(true), mode: z.enum(['auto','free','api']).default('auto'), maxPages: z.number().int().min(1).max(30).default(15) }).parse(await body(req));
          if ((await knowledgeFor(id)).length >= 100) throw new ApiError(400, 'Remove unused files before adding a research report.');
          const snapshot=Object.fromEntries(['name','industry','size','businessModel','geography','products','about'].map(key=>[key,String(company[key as keyof typeof company]||'')]));
          return json(await enqueueResearch(id,user.id,{...input,name:company.name,snapshot}),202);
        }
      }
      if (method === "DELETE" && parts.length === 2) {
        const { confirmation } = z.object({ confirmation: z.string() }).parse(await body(req));
        if (confirmation !== company.name) throw new ApiError(400, "Type the exact company name to delete it.");
        await db().query("DELETE FROM companies WHERE id=? AND owner_id=?", [id, user.id]); await audit(user.id, id, `Deleted company ${company.name}`); return json({ ok: true });
      }
      if (parts[2] === "knowledge") {
        if (method === "GET") return json(await knowledgeFor(id));
        if (method === "POST") {
          if (Number(req.headers.get("content-length") || 0) > 9 * 1024 * 1024) throw new ApiError(413, "Maximum upload is 8 MB.");
          const form = await req.formData(); const file = form.get("file");
          if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) throw new ApiError(400, "Choose a nonempty file up to 8 MB.");
          const count = await db().one("SELECT COUNT(*) AS n FROM knowledge WHERE company_id=?", [id]);
          if (Number(count?.n) >= 100) throw new ApiError(400, "This company already has 100 files. Remove unused files first.");
          const buffer = Buffer.from(await file.arrayBuffer()); let content = ""; let status = "Stored · extraction pending";
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (!["txt", "md", "csv", "json", "pdf", "docx", "pptx", "xlsx", "png", "jpg", "jpeg", "webp"].includes(ext || "")) throw new ApiError(400, "Supported: TXT, MD, CSV, JSON, PDF, DOCX, PPTX, XLSX, PNG, JPG, WEBP.");
          try {
            if (["txt", "md", "csv", "json"].includes(ext || "")) content = buffer.toString("utf8");
            if (ext === "docx" || ext === "pptx") content = officeText(buffer, ext);
            if (ext === "pdf") { const { PDFParse } = await import("pdf-parse"); const parser = new PDFParse({ data: buffer }); try { content = (await parser.getText()).text; } finally { await parser.destroy(); } }
            if (content.trim()) status = "Text indexed · lexical search";
          } catch (error) { console.warn("Document extraction failed", error instanceof Error ? error.message : "Unknown extraction error"); status = "Stored · extraction failed"; }
          if (content.length > 1000000) { content = content.slice(0, 1000000); status = "Text indexed · truncated at 1M characters"; }
          const kid = randomUUID(); const category = String(form.get("category") || "Company information").slice(0, 100);
          await db().query("INSERT INTO knowledge(id,company_id,name,size,type,category,status,content,blob,created) VALUES(?,?,?,?,?,?,?,?,?,?)", [kid, id, file.name.slice(0, 255), file.size, file.type || "application/octet-stream", category, status, content, buffer.toString("base64"), new Date().toISOString()]);
          for (let pos = 0, ordinal = 0; pos < content.length; pos += 1000, ordinal++) await db().query("INSERT INTO chunks(id,knowledge_id,company_id,content,ordinal) VALUES(?,?,?,?,?)", [`${kid}:${ordinal}`, kid, id, content.slice(pos, pos + 1200), ordinal]);
          await audit(user.id, id, `Uploaded ${file.name}: ${status}`); return json(await knowledgeFor(id), 201);
        }
      }
      if (parts[2] === "pods" && method === "POST") {
        if (company.status !== "active") throw new ApiError(400, "Activate the company blueprint first.");
        const input = podSchema.parse(await body(req));
        const available = await knowledgeFor(id);
        if (input.knowledgeIds.some(k => !available.some(a => a.id === k))) throw new ApiError(400, "Selected knowledge does not belong to this company.");
        const pod = buildRun(company, input, await agentLimits(id));
        const saved = await insertProjectPod(user.id, pod);
        await audit(user.id, id, `Created ${input.mode} pod: ${pod.name}`); return json(saved, 201);
      }
    }
    if (parts[0] === "knowledge" && parts[1]) {
      const row = await db().one("SELECT k.* FROM knowledge k JOIN companies c ON c.id=k.company_id WHERE k.id=? AND c.owner_id=?", [parts[1], user.id]);
      if (!row) throw new ApiError(404, "File not found.");
      if (method === "GET") {
        if (parts[2] === "preview") {
          const bytes = Buffer.from(String(row.blob), "base64");
          const mime = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "image/png" : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "image/jpeg" : bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP" ? "image/webp" : "";
          if (!mime) throw new ApiError(400, "This file is not a supported raster image.");
          return new Response(bytes, { headers: { "Content-Type": mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
        }
        return new Response(Buffer.from(String(row.blob), "base64"), { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(String(row.name))}`, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } });
      }
      if (method === "DELETE") { await db().query("DELETE FROM knowledge WHERE id=?", [parts[1]]); await audit(user.id, String(row.company_id), `Removed knowledge ${row.name}`); return json({ ok: true }); }
    }
    if (parts[0] === "pods" && parts[1]) {
      const pod = await podFor(parts[1], user.id);
      if (parts[2] === "agents" && ["POST", "DELETE"].includes(method)) {
        if (!["Ready", "Blocked"].includes(pod.status) || pod.tasks.some(t => t.status !== "Planned")) throw new ApiError(409, "Change the pod team before execution begins.");
        const id = method === "POST" ? z.object({ agentId: z.string() }).parse(await body(req)).agentId : parts[3];
        const agent = id && registryAgent(id);
        if (!agent || agent.category === "platform") throw new ApiError(400, "Choose a specialist from the registry.");
        if (method === "POST" && pod.roleIds.includes(id)) return json(pod);
        if (method === "DELETE" && !pod.roleIds.includes(id)) throw new ApiError(404, "Specialist is not assigned to this pod.");
        const roleIds = method === "POST" ? [...new Set([...pod.roleIds, id])] : pod.roleIds.filter(roleId => roleId !== id);
        if (!roleIds.length) throw new ApiError(400, "A pod needs at least one specialist.");
        if (roleIds.length > 25) throw new ApiError(400, "A pod can have at most 25 specialists.");
        const company = await companyFor(pod.companyId, user.id);
        const replanned = buildRun(company, { name: pod.name, objective: pod.objective, domain: pod.domain, answers: pod.answers, roleIds, knowledgeIds: pod.knowledgeIds, autonomy: pod.autonomy, mode: pod.mode, requested: pod.requested }, await agentLimits(pod.companyId));
        pod.roleIds = roleIds; pod.tasks = replanned.tasks;
        event(pod, "Owner", `${method === "POST" ? "Added" : "Removed"} ${agent.name} ${method === "POST" ? "to" : "from"} the pod and refreshed the plan.`);
        await audit(user.id, pod.companyId, `${method === "POST" ? "Added" : "Removed"} ${agent.name} ${method === "POST" ? "to" : "from"} ${pod.name}`);
        return json(await savePod(pod));
      }
      if (method === "GET" && parts[2] === "download") return new Response(pod.result || "No final result yet.", { headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": `attachment; filename="pod-${pod.id}.md"`, "Cache-Control": "no-store" } });
      if (method === "POST") {
        const raw = await body(req);
        if (parts[2] === "decision") { const input = z.object({ taskId: z.string(), decision: z.enum(["approve", "changes", "reject"]), feedback: z.string().max(12000) }).parse(raw); return json(await decideTask(pod, input.taskId, input.decision, input.feedback, user.id)); }
        if (parts[2] === "run") {
          if (!["Ready", "Blocked"].includes(pod.status)) throw new ApiError(409, "This pod is already running, awaiting a decision, or finished.");
          for (const task of pod.tasks) if (task.status === "Blocked") { task.status = "Planned"; task.progress = 0; }
          pod.status = "Queued"; pod.paused = false; event(pod, "Owner", "Queued execution."); return json(await savePod(pod));
        }
        if (parts[2] === "retry-blocked" && pod.templateId) {
          if (["Completed", "Rejected"].includes(pod.status)) throw new ApiError(409, "This project is finished.");
          const company = await companyFor(pod.companyId, user.id);
          if (company.version !== pod.contextVersion) throw new ApiError(409, "Company context changed. Create a new project with the updated blueprint.");
          if (!pod.tasks.some(t => t.status === "Blocked")) throw new ApiError(409, "No blocked tasks to retry.");
          for (const task of pod.tasks) if (task.status === "Blocked") { task.status = "Planned"; task.progress = 0; task.leaseId = undefined; }
          const { demoStatus } = await import("@/lib/server/demo-worker");
          demoStatus(pod); event(pod, "Owner", "Queued blocked tasks for retry; completed work and pending approvals are preserved.");
          return json(await savePod(pod));
        }
        if (parts[2] === "pause") { pod.paused = z.boolean().parse(raw.paused); if (pod.status === "Running") { pod.status = "Queued"; for (const task of pod.tasks) if (task.status === "Running") { task.status = "Planned"; task.progress = 0; } } event(pod, "Owner", pod.paused ? "Paused pod." : "Resumed pod."); return json(await savePod(pod)); }
      }
    }
    throw new ApiError(404, "Endpoint not found.");
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: error.issues.map(x => `${x.path.join(".")}: ${x.message}`).join("; ") }, 400);
    if (error instanceof ApiError) return json({ error: error.message }, error.status);
    console.error("API failure", error); return json({ error: "The request could not be completed. Please try again." }, 500);
  }
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
