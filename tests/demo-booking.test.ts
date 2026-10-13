import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const directory=mkdtempSync(path.join(tmpdir(),"ai-pods-demo-booking-"));
process.env.DATABASE_URL=`file:${path.join(directory,"demo.sqlite")}`;
process.env.MAIL_MODE="console";
delete process.env.RESEND_API_KEY;

function month(value:Date){return value.toISOString().slice(0,7);}

test("demo booking availability, recommendation and booking lifecycle",async()=>{
  const booking=await import("../lib/server/demo-booking");
  const { db }=await import("../lib/server/db");
  try{
    const now=new Date();
    const months=[month(now),month(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1))),month(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+2,1)))];
    const availability=[];
    for(const value of months)availability.push(await booking.demoAvailability(value,"Asia/Kolkata"));
    const slots=availability.flatMap(result=>result.days.flatMap(day=>day.slots));
    assert.ok(slots.length>1,"expected at least two available booking slots");

    const input={
      firstName:"Ava",lastName:"Shah",email:"ava@example.test",company:"Northstar Software",jobTitle:"COO",
      industry:"Software",companySize:"51–200",primaryGoal:"Reduce product research and release planning time by thirty percent.",
      currentTools:["GitHub","Jira","Slack"],areasOfInterest:["Product","Research","Engineering"],additionalContext:"Use a product launch workflow.",
      scheduledAt:slots[0].scheduledAt,timezone:"Asia/Kolkata",duration:30,meetingType:"Video meeting",source:"test-suite",
    };
    const created=await booking.createDemoBooking(input);
    assert.equal(created.booking.status,"CONFIRMED");
    assert.equal(created.booking.provider,"internal");
    assert.equal(created.booking.recommendation.recommendedPod,"Product Delivery Pod");
    assert.ok(created.booking.recommendation.recommendedAgents.length>=4);
    assert.ok(created.booking.recommendation.recommendedIntegrations.includes("GitHub"));
    assert.ok(created.manageToken.length>=40);

    const loaded=await booking.getDemoBooking(created.booking.id,created.manageToken);
    assert.equal(loaded.email,"ava@example.test");
    await assert.rejects(()=>booking.getDemoBooking(created.booking.id,"wrong-token"),/Booking not found/);
    await assert.rejects(()=>booking.createDemoBooking({...input,email:"second@example.test"}),/no longer available|just booked/);

    const moved=await booking.rescheduleDemoBooking(created.booking.id,created.manageToken,slots[1].scheduledAt,"Asia/Kolkata");
    assert.equal(moved.status,"RESCHEDULED");
    assert.equal(moved.scheduledAt,slots[1].scheduledAt);
    const cancelled=await booking.cancelDemoBooking(created.booking.id,created.manageToken);
    assert.equal(cancelled.status,"CANCELLED");

    await booking.recordDemoAnalytics("booking-confirmed","/book-demo",{provider:"internal"});
    assert.equal((await db().one("SELECT COUNT(*) AS count FROM demo_analytics WHERE event=?",["booking-confirmed"]))?.count,1);
    await assert.rejects(()=>booking.demoAvailability(month(now),"Invalid/Timezone"),/valid timezone/);
  }finally{
    await db().close();
    rmSync(directory,{recursive:true,force:true});
  }
});
