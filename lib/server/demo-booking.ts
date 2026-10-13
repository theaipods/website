import { randomBytes, randomUUID } from "node:crypto";
import { db } from "./db";
import { ApiError, hash } from "./auth";
import { recommendDemoWorkforce, type DemoRecommendationInput } from "../demo-recommendation";

export const bookingStatuses = ["PENDING","CONFIRMED","RESCHEDULED","CANCELLED","COMPLETED","NO_SHOW","FAILED"] as const;
export const bookingEvents = ["DEMO_BOOKING_STARTED","DEMO_DATE_SELECTED","DEMO_TIME_SELECTED","DEMO_BOOKING_CREATED","DEMO_BOOKING_CONFIRMED","DEMO_BOOKING_RESCHEDULED","DEMO_BOOKING_CANCELLED","DEMO_BOOKING_COMPLETED"] as const;
export const analyticsEvents = ["book-demo-page-view","calendar-opened","date-selected","time-selected","form-started","form-completed","booking-submitted","booking-confirmed","booking-failed","booking-rescheduled","booking-cancelled","CTA-click","workflow-demo-viewed","integration-demo-viewed","worker-card-viewed","faq-opened"] as const;

export type DemoBookingInput = DemoRecommendationInput & { firstName:string;lastName:string;email:string;company:string;jobTitle:string;additionalContext:string;scheduledAt:string;timezone:string;duration:number;meetingType:string;source?:string;campaign?:string;utm?:Record<string,string>;referrer?:string };

type Slot = { scheduledAt:string; label:string };
export type AvailabilityDay = { date:string; available:boolean; slots:Slot[] };

const partsInZone=(date:Date,timeZone:string)=>Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(date).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]));
function zonedDate(y:number,m:number,d:number,h:number,minute:number,timeZone:string){const desired=Date.UTC(y,m-1,d,h,minute);let guess=desired;for(let i=0;i<3;i++){const p=partsInZone(new Date(guess),timeZone);const represented=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute);guess+=desired-represented;}return new Date(guess);}
function validZone(timeZone:string){try{new Intl.DateTimeFormat("en",{timeZone});return true;}catch{return false;}}
const pad=(value:number)=>String(value).padStart(2,"0");

export interface SchedulingProvider { id:string; duration:number; availability(month:string,timeZone:string):Promise<AvailabilityDay[]>; }
class InternalSchedulingProvider implements SchedulingProvider {
  id="internal"; duration=30;
  async availability(month:string,timeZone:string){
    if(!/^\d{4}-\d{2}$/.test(month)) throw new ApiError(400,"Choose a valid month.");
    if(!validZone(timeZone)) throw new ApiError(400,"Choose a valid timezone.");
    const [year,monthNumber]=month.split("-").map(Number); if(year<2025||monthNumber<1||monthNumber>12) throw new ApiError(400,"Choose a valid month.");
    const booked=new Set((await db().all("SELECT slot_key FROM demo_bookings WHERE slot_key IS NOT NULL")).map(row=>String(row.slot_key)));
    const today=new Date(); const earliest=today.getTime()+3*60*60*1000; const latest=today.getTime()+62*24*60*60*1000;
    const result:AvailabilityDay[]=[]; const days=new Date(Date.UTC(year,monthNumber,0)).getUTCDate();
    for(let day=1;day<=days;day++){
      const weekday=new Date(Date.UTC(year,monthNumber-1,day)).getUTCDay(); const date=`${year}-${pad(monthNumber)}-${pad(day)}`; const slots:Slot[]=[];
      if(weekday!==0&&weekday!==6) for(const [hour,minute] of [[10,0],[11,30],[14,0],[16,0]]) { const at=zonedDate(year,monthNumber,day,hour,minute,timeZone); const key=`${at.toISOString()}|${this.duration}`; if(at.getTime()>earliest&&at.getTime()<latest&&!booked.has(key)) slots.push({scheduledAt:at.toISOString(),label:new Intl.DateTimeFormat("en",{timeZone,hour:"numeric",minute:"2-digit"}).format(at)}); }
      result.push({date,available:slots.length>0,slots});
    }
    return result;
  }
}
export function schedulingProvider():SchedulingProvider{return new InternalSchedulingProvider();}
export async function demoAvailability(month:string,timeZone:string){const provider=schedulingProvider();const days=await provider.availability(month,timeZone);return{provider:provider.id,duration:provider.duration,timeZone,days,nextAvailableDate:days.find(day=>day.available)?.date||null};}

async function bookingEvent(bookingId:string|null,type:string,detail:Record<string,unknown>={}){await db().query("INSERT INTO demo_booking_events(id,booking_id,type,detail,at) VALUES(?,?,?,?,?)",[randomUUID(),bookingId,type,JSON.stringify(detail),new Date().toISOString()]);}
async function sendConfirmation(input:DemoBookingInput,id:string,token:string){
  const date=new Date(input.scheduledAt);const when=new Intl.DateTimeFormat("en",{timeZone:input.timezone,dateStyle:"full",timeStyle:"short"}).format(date);
  const base=(process.env.NEXT_PUBLIC_APP_URL||process.env.APP_URL||"http://localhost:3000").replace(/\/$/,"");
  const manageUrl=`${base}/book-demo?booking=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
  const text=`Your AI workforce demo is booked.\n\nWhen: ${when}\nDuration: ${input.duration} minutes\nCompany: ${input.company}\nObjective: ${input.primaryGoal}\n\nAgenda: review your objective, map a recommended Pod, explore tools and MCP, and agree next steps.\n\nPlease bring one important workflow and the systems that hold its context.\n\nChange or cancel your booking: ${manageUrl}\nBooking reference: ${id}`;
  if((process.env.DEMO_MAIL_MODE||process.env.MAIL_MODE)==="console"||process.env.NODE_ENV!=="production"){console.info(`[LOCAL DEMO MAIL] ${input.email}: ${id}`);return "console";}
  if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM)return "not_configured";
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.RESEND_FROM,to:[input.email],subject:"Your AI workforce demo is booked",text}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error("Confirmation provider rejected the request"); return "sent";
}
function publicBooking(row:Record<string,string|number|null>){return{id:String(row.id),firstName:String(row.first_name),lastName:String(row.last_name),email:String(row.email),company:String(row.company),jobTitle:String(row.job_title),industry:String(row.industry),companySize:String(row.company_size),primaryGoal:String(row.primary_goal),currentTools:JSON.parse(String(row.current_tools)),areasOfInterest:JSON.parse(String(row.areas_of_interest)),additionalContext:String(row.additional_context),scheduledAt:String(row.scheduled_at),timezone:String(row.timezone),duration:Number(row.duration),meetingType:String(row.meeting_type),provider:String(row.provider),status:String(row.status),recommendation:JSON.parse(String(row.recommendation)),createdAt:String(row.created),updatedAt:String(row.updated)};}

export async function createDemoBooking(input:DemoBookingInput){
  const provider=schedulingProvider(); if(input.duration!==provider.duration)throw new ApiError(400,"The selected duration is unavailable.");
  const date=new Date(input.scheduledAt);if(!Number.isFinite(date.getTime()))throw new ApiError(400,"Choose a valid appointment time.");
  if(!validZone(input.timezone))throw new ApiError(400,"Choose a valid timezone.");
  const zoneParts=partsInZone(date,input.timezone);const month=`${zoneParts.year}-${zoneParts.month}`;const availability=await provider.availability(month,input.timezone);
  if(!availability.some(day=>day.slots.some(slot=>slot.scheduledAt===date.toISOString())))throw new ApiError(409,"That time is no longer available. Choose another time.");
  const now=new Date().toISOString();const leadId=randomUUID();const id=randomUUID();const token=randomBytes(24).toString("hex");const recommendation=recommendDemoWorkforce(input);const source=input.source?.slice(0,120)||"book-demo";
  const leadData={firstName:input.firstName,lastName:input.lastName,company:input.company,jobTitle:input.jobTitle,industry:input.industry,companySize:input.companySize,primaryGoal:input.primaryGoal,currentTools:input.currentTools,areasOfInterest:input.areasOfInterest,campaign:input.campaign||"",utm:input.utm||{},referrer:input.referrer||""};
  await db().query("INSERT INTO demo_leads(id,email,data,status,source,created,updated) VALUES(?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET data=?,status=?,source=?,updated=?",[leadId,input.email,JSON.stringify(leadData),"DEMO_BOOKED",source,now,now,JSON.stringify(leadData),"DEMO_BOOKED",source,now]);
  const savedLead=await db().one("SELECT id FROM demo_leads WHERE email=?",[input.email]);
  try{await db().query("INSERT INTO demo_bookings(id,lead_id,first_name,last_name,email,company,job_title,industry,company_size,primary_goal,current_tools,areas_of_interest,additional_context,scheduled_at,timezone,duration,meeting_type,provider,external_event_id,status,manage_token_hash,slot_key,recommendation,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,String(savedLead.id),input.firstName,input.lastName,input.email,input.company,input.jobTitle,input.industry,input.companySize,input.primaryGoal,JSON.stringify(input.currentTools),JSON.stringify(input.areasOfInterest),input.additionalContext,date.toISOString(),input.timezone,input.duration,input.meetingType,provider.id,null,"CONFIRMED",hash(token),`${date.toISOString()}|${input.duration}`,JSON.stringify(recommendation),now,now]);}catch(error){if(error instanceof Error&&/unique|duplicate/i.test(error.message))throw new ApiError(409,"That time was just booked. Choose another time.");throw error;}
  await bookingEvent(id,"DEMO_BOOKING_CREATED",{provider:provider.id});await bookingEvent(id,"DEMO_BOOKING_CONFIRMED",{scheduledAt:date.toISOString(),timezone:input.timezone});
  let emailStatus="failed";try{emailStatus=await sendConfirmation(input,id,token);}catch(error){console.error("Demo confirmation email failed",error);await bookingEvent(id,"DEMO_EMAIL_FAILED",{});}
  const row=await db().one("SELECT * FROM demo_bookings WHERE id=?",[id]);return{booking:publicBooking(row),manageToken:token,emailStatus};
}
export async function getDemoBooking(id:string,token:string){const row=await db().one("SELECT * FROM demo_bookings WHERE id=? AND manage_token_hash=?",[id,hash(token)]);if(!row)throw new ApiError(404,"Booking not found.");return publicBooking(row);}
export async function cancelDemoBooking(id:string,token:string){const row=await db().one("SELECT * FROM demo_bookings WHERE id=? AND manage_token_hash=?",[id,hash(token)]);if(!row)throw new ApiError(404,"Booking not found.");if(String(row.status)==="CANCELLED")return publicBooking(row);const now=new Date().toISOString();await db().query("UPDATE demo_bookings SET status='CANCELLED',slot_key=NULL,updated=? WHERE id=?",[now,id]);await bookingEvent(id,"DEMO_BOOKING_CANCELLED",{});return getDemoBooking(id,token);}
export async function rescheduleDemoBooking(id:string,token:string,scheduledAt:string,timezone:string){const row=await db().one("SELECT * FROM demo_bookings WHERE id=? AND manage_token_hash=?",[id,hash(token)]);if(!row)throw new ApiError(404,"Booking not found.");const provider=schedulingProvider();const date=new Date(scheduledAt);if(!Number.isFinite(date.getTime())||!validZone(timezone))throw new ApiError(400,"Choose a valid appointment time.");const p=partsInZone(date,timezone);const available=await provider.availability(`${p.year}-${p.month}`,timezone);if(!available.some(day=>day.slots.some(slot=>slot.scheduledAt===date.toISOString())))throw new ApiError(409,"That time is no longer available. Choose another time.");const now=new Date().toISOString();try{await db().query("UPDATE demo_bookings SET scheduled_at=?,timezone=?,status='RESCHEDULED',slot_key=?,updated=? WHERE id=?",[date.toISOString(),timezone,`${date.toISOString()}|${provider.duration}`,now,id]);}catch(error){if(error instanceof Error&&/unique|duplicate/i.test(error.message))throw new ApiError(409,"That time was just booked. Choose another time.");throw error;}await bookingEvent(id,"DEMO_BOOKING_RESCHEDULED",{scheduledAt:date.toISOString(),timezone});return getDemoBooking(id,token);}
export async function recordDemoAnalytics(event:string,path:string,detail:Record<string,string>){if(!(analyticsEvents as readonly string[]).includes(event))throw new ApiError(400,"Unknown analytics event.");const safe=Object.fromEntries(Object.entries(detail).slice(0,12).map(([key,value])=>[key.slice(0,40),String(value).slice(0,120)]));await db().query("INSERT INTO demo_analytics(id,event,path,detail,at) VALUES(?,?,?,?,?)",[randomUUID(),event,path.slice(0,200),JSON.stringify(safe),new Date().toISOString()]);}
