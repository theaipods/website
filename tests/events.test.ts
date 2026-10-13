import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const directory=mkdtempSync(path.join(tmpdir(),"ai-pods-events-"));
process.env.DATABASE_URL=`file:${path.join(directory,"events.sqlite")}`;
delete process.env.RESEND_API_KEY;

test("event catalog, search and registration lifecycle",async()=>{
  const events=await import("../lib/server/events");
  const {db}=await import("../lib/server/db");
  try{
    const catalog=await events.listEvents({period:"UPCOMING"});
    assert.ok(catalog.events.length>=4);
    assert.ok(catalog.featured);
    assert.equal(catalog.featured?.sample,true);
    const finance=await events.listEvents({q:"finance"});
    assert.ok(finance.events.some(event=>event.slug.includes("finance")));
    const detail=await events.getEvent("ai-workforce-live-objective-to-employees");
    assert.equal(detail.event.type,"LIVE_DEMO");
    assert.ok(detail.speakers.every(speaker=>speaker.sample));
    const created=await events.registerForEvent({eventId:detail.event.id,firstName:"Ava",lastName:"Shah",email:"ava.events@example.test",company:"Northstar",jobTitle:"COO",companySize:"51–200",industry:"Technology",interests:["AI Workforce"],notes:"Architecture and controls"});
    assert.equal(created.registration.status,"CONFIRMED");
    assert.ok(created.manageToken.length>=40);
    assert.equal((await events.getEventRegistration(created.registration.id,created.manageToken)).registration.email,"ava.events@example.test");
    await assert.rejects(()=>events.getEventRegistration(created.registration.id,"invalid"),/Registration not found/);
    await assert.rejects(()=>events.registerForEvent({eventId:detail.event.id,firstName:"Ava",lastName:"Shah",email:"ava.events@example.test",company:"Northstar",jobTitle:"COO",companySize:"51–200",industry:"Technology",interests:[],notes:""}),/already registered/);
    const cancelled=await events.cancelEventRegistration(created.registration.id,created.manageToken);
    assert.equal(cancelled.status,"CANCELLED");
    const draft={...detail.event,id:"event-test-draft",slug:"test-private-workshop",title:"Private workshop draft",featured:false,visibility:"PRIVATE" as const,sample:false};
    await events.saveAdminEvent(draft);
    await assert.rejects(()=>events.getEvent(draft.slug),/Event not found/);
    await events.saveAdminEvent({...draft,visibility:"PUBLIC"});
    assert.equal((await events.getEvent(draft.slug)).event.title,"Private workshop draft");
    await events.eventMetric("event_view","/events/test",{eventId:detail.event.id});
    assert.equal((await db().one("SELECT COUNT(*) AS count FROM event_analytics WHERE event='event_view'"))?.count,1);
  }finally{await db().close();rmSync(directory,{recursive:true,force:true})}
});
