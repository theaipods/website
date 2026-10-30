import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {defaultCompany,type Business} from "../lib/workforce";
import {demoTemplates,reasoningFor} from "../lib/demo-templates";
import {isCompanyEmail} from "../lib/company-email";
import {buildDemoProject} from "../lib/server/demo-projects";
import {insertProjectPod,accountPlan} from "../lib/server/plans";
import {db,Database} from "../lib/server/db";
import {advancePod,decideTask} from "../lib/server/orchestrator";
import {podFor} from "../lib/server/repository";
import {sealToken,openToken,addProfileServer,profileServers,grantProfileTool,removeProfileServer} from "../lib/server/profile-mcp";
import {generate} from "../lib/server/providers";
import {bedrockRequest} from "../lib/server/bedrock";
const dir=mkdtempSync(path.join(tmpdir(),"pods-demo-"));process.env.DATABASE_URL=`file:${path.join(dir,"demo.sqlite")}`;
const company:Business={...defaultCompany(),id:"company",version:1,created:new Date().toISOString(),name:"Demo Company",status:"active"};
const owner="owner";
test("company email filter and effort levels",()=>{
  for(const email of ["person@gmail.com","p@Yahoo.com","p@outlook.com","p@mailinator.com","p@sub.gmail.com"]) assert.equal(isCompanyEmail(email),false,email);
  assert.equal(isCompanyEmail("founder@theaipods.com"),true);
  assert.equal(isCompanyEmail("p@example.com",["example.com"]),false);
  assert.deepEqual([reasoningFor("simple"),reasoningFor("moderate"),reasoningFor("complex")],["medium","high","xhigh"]);
});
test("Bedrock builds Converse requests with explicit Sonnet effort mapping",()=>{
  process.env.CODE_MODEL_NAME="test-sonnet-profile";process.env.CODE_REASONING_XHIGH="high";process.env.CODE_BEDROCK_THINKING="adaptive";
  const input={capability:"code" as const,instructions:"Code role",context:{},task:"Build",acceptance:"Testable",maxOutputTokens:10000,reasoningEffort:"xhigh" as const};
  const request=bedrockRequest(input);assert.equal(request.modelId,"test-sonnet-profile");assert.deepEqual(request.additionalModelRequestFields,{thinking:{type:"adaptive"},output_config:{effort:"high"}});
  process.env.CODE_BEDROCK_THINKING="extended";assert.deepEqual(bedrockRequest(input).additionalModelRequestFields,{thinking:{type:"enabled",budget_tokens:8192}});delete process.env.CODE_BEDROCK_THINKING;
});
test("local demo persistence, quota and execution",async t=>{
  try {
    await db().query("INSERT INTO users(id,email,name,password,verified,created) VALUES(?,?,?,?,1,?)",[owner,"owner@example.test","Owner","unused",new Date().toISOString()]);
    await db().query("INSERT INTO companies(id,owner_id,data,created) VALUES(?,?,?,?)",[company.id,owner,JSON.stringify(company),new Date().toISOString()]);
    await t.test("all templates resolve real specialists and acyclic dependencies",()=>{
      for(const template of demoTemplates){const p=buildDemoProject(company,template.id,template.prompt,"simulation","smart",[]);const seen=new Set<string>();for(const task of p.tasks){assert.ok(task.dependencies.every(id=>seen.has(id)),task.title);seen.add(task.id);}assert.ok(p.tasks.length>=9);assert.ok(p.estimatedMinutes!>0);}
    });
    await t.test("concurrent Starter creation admits exactly one project",async()=>{
      assert.equal((await accountPlan(owner)).id,"starter");
      const create=()=>insertProjectPod(owner,buildDemoProject(company,demoTemplates[0].id,demoTemplates[0].prompt,"simulation","smart",[]));
      const results=await Promise.allSettled([create(),create()]);assert.equal(results.filter(r=>r.status==="fulfilled").length,1);assert.equal((await accountPlan(owner)).usedProjects,1);
      const other=new Database(process.env.DATABASE_URL);assert.equal(Number((await other.one("SELECT COUNT(*) AS n FROM projects"))?.n),1);await other.close();
      await db().query("UPDATE account_plans SET plan='enterprise' WHERE user_id=?",[owner]);
    });
    await t.test("repeating a submission key returns its original Pod without using more allowance",async()=>{
      const key=randomUUID();const create=()=>insertProjectPod(owner,buildDemoProject(company,"marketing-launch",demoTemplates[0].prompt,"simulation","smart",[]),key);
      const before=(await accountPlan(owner)).usedPods;const [a,b]=await Promise.all([create(),create()]);assert.equal(a.id,b.id);assert.equal((await accountPlan(owner)).usedPods,before+1);
    });
    await t.test("approval blocks its branch while independent work completes, then resumes without replay",async()=>{
      let p=await insertProjectPod(owner,buildDemoProject(company,"marketing-launch",demoTemplates[0].prompt,"simulation","smart",[]));
      await advancePod(p.id,owner);await advancePod(p.id,owner);await advancePod(p.id,owner);
      p=await podFor(p.id,owner);
      assert.equal(p.tasks.find(t=>t.title.includes("Twelve-post"))?.status,"Completed");
      assert.equal(p.tasks.find(t=>t.title.includes("positioning"))?.status,"Needs approval");
      const original=p.tasks[0].output;
      const db2=new Database(process.env.DATABASE_URL);const persisted=JSON.parse(String((await db2.one("SELECT data FROM pods WHERE id=?",[p.id]))?.data));assert.equal(persisted.tasks[0].output,original);await db2.close();
      for(let i=0;i<20&&p.status!=="Completed";i++) {for(const task of p.tasks.filter(t=>t.status==="Needs approval")){p=await podFor(p.id,owner);await decideTask(p,task.id,"approve","",owner);}await advancePod(p.id,owner);p=await podFor(p.id,owner);}
      assert.equal(p.status,"Completed");assert.equal(p.tasks[0].output,original);assert.equal(p.tasks[0].revision,1);
    });
    await t.test("auto finishes without checkpoints; manual queues each draft; revisions preserve independent output",async()=>{
      let p=await insertProjectPod(owner,buildDemoProject(company,"sales-pipeline",demoTemplates[1].prompt,"simulation","auto",[]));
      for(let i=0;i<20&&p.status!=="Completed";i++){await advancePod(p.id,owner);p=await podFor(p.id,owner);}assert.equal(p.status,"Completed");
      p=await insertProjectPod(owner,buildDemoProject(company,"sales-pipeline",demoTemplates[1].prompt,"simulation","manual",[]));await advancePod(p.id,owner);p=await podFor(p.id,owner);assert.equal(p.tasks[0].status,"Needs approval");
      p=await decideTask(p,p.tasks[0].id,"changes","Add clearer acceptance checks",owner);assert.equal(p.tasks[0].revision,2);await advancePod(p.id,owner);p=await podFor(p.id,owner);assert.equal(p.tasks[0].status,"Needs approval");
    });
    await t.test("concurrent approval does not discard an independent in-flight result",async()=>{
      process.env.CHAT_MODEL_URL="https://models.example.test/gateway";process.env.CHAT_MODEL_KEY="fixture";process.env.CHAT_MODEL_NAME="fixture";
      let p=buildDemoProject(company,"sales-pipeline",demoTemplates[1].prompt,"live","smart",[]);
      p.tasks=p.tasks.slice(0,3);p.tasks[0].status="Needs approval";p.tasks[0].output="review this";p.tasks[1].dependencies=[];p.tasks[2].dependencies=[p.tasks[1].id];p=await insertProjectPod(owner,p);
      const savedFetch=globalThis.fetch;let release!:(value:Response)=>void;let started!:()=>void;const signal=new Promise<void>(resolve=>started=resolve);
      globalThis.fetch=async()=>{started();return new Promise<Response>(resolve=>release=resolve);};
      try{const running=advancePod(p.id,owner);await signal;await decideTask(await podFor(p.id,owner),p.tasks[0].id,"approve","",owner);release(Response.json({text:"Actual provider fixture result"}));await running;
        const latest=await podFor(p.id,owner);assert.equal(latest.tasks[0].status,"Completed");assert.equal(latest.tasks[1].output,"Actual provider fixture result");
      }finally{globalThis.fetch=savedFetch;}
    });
    await t.test("expired task leases preserve completed work and block only interrupted task",async()=>{
      let p=buildDemoProject(company,"sales-pipeline",demoTemplates[1].prompt,"simulation","auto",[]);p.tasks[0].status="Completed";p.tasks[0].output="preserve";p.tasks[1].status="Running";p.tasks[1].startedAt="2000-01-01";p.tasks[1].leaseId=randomUUID();p.status="Running";p=await insertProjectPod(owner,p);await advancePod(p.id,owner);p=await podFor(p.id,owner);assert.equal(p.tasks[1].status,"Blocked");assert.equal(p.tasks[0].output,"preserve");
    });
    await t.test("profile MCP tokens are encrypted and connections are owner scoped",async()=>{
      process.env.MCP_SECRET_KEY="ab".repeat(32);const secret=sealToken("private-token");assert.ok(!secret.includes("private-token"));assert.equal(openToken(secret),"private-token");
      const id=await addProfileServer(owner,"CRM","https://mcp.example.com/mcp","private-token");const list=await profileServers(owner);assert.equal(list[0].hasToken,true);assert.ok(!JSON.stringify(list).includes("private-token"));assert.deepEqual(await profileServers("other"),[]);await assert.rejects(grantProfileTool("other",id,"read",true));await assert.rejects(removeProfileServer("other",id));await removeProfileServer(owner,id);
    });
    await t.test("Responses adapter sends selected reasoning and rejects incomplete artifacts",async()=>{
      process.env.CHAT_MODEL_FORMAT="responses";const original=globalThis.fetch;
      try{globalThis.fetch=async(_url,init)=>{const body=JSON.parse(String(init?.body));assert.equal(body.reasoning.effort,"xhigh");assert.equal(body.store,false);return Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:"Generated work"}]}]});};
        assert.equal(await generate({capability:"chat",instructions:"role",context:{},task:"task",acceptance:"criteria",maxOutputTokens:2048,reasoningEffort:"xhigh"}),"Generated work");
        globalThis.fetch=async()=>Response.json({status:"incomplete",output:[]});await assert.rejects(generate({capability:"chat",instructions:"role",context:{},task:"task",acceptance:"criteria",maxOutputTokens:2048}),/incomplete/);
      }finally{globalThis.fetch=original;}
    });
  }finally{await db().close();rmSync(dir,{recursive:true,force:true});}
});
