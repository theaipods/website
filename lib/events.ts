export const eventTypes = ["LIVE_DEMO","WEBINAR","WORKSHOP","CONFERENCE","ROUNDTABLE","EXECUTIVE_SESSION","PRODUCT_EVENT","COMMUNITY","ON_DEMAND","PRIVATE_SESSION"] as const;
export const eventStatuses = ["UPCOMING","REGISTRATION_OPEN","REGISTRATION_CLOSED","LIVE","COMPLETED","CANCELLED","POSTPONED","ON_DEMAND"] as const;
export type EventType = typeof eventTypes[number];
export type EventStatus = typeof eventStatuses[number];
export type AgendaItem = { time:string; title:string; description:string };
export type EventSpeaker = { id:string; name:string; role:string; company:string; bio:string; photo:string; linkedin:string; expertise:string[]; sample:boolean };
export type PodEvent = {
  id:string; slug:string; title:string; subtitle:string; description:string; type:EventType; status:EventStatus;
  startAt:string; endAt:string; timezone:string; duration:number; format:"Virtual"|"In Person"|"Hybrid"|"On Demand";
  location:string; virtualUrl:string; registrationUrl:string; recordingUrl:string; thumbnail:string; heroVisual:string;
  speakerIds:string[]; topics:string[]; industries:string[]; tags:string[]; agenda:AgendaItem[]; learn:string[]; audience:string[];
  relatedAgents:string[]; integrations:string[]; featured:boolean; visibility:"PUBLIC"|"PRIVATE"; capacity:number|null; registrationCount:number|null;
  createdAt:string; updatedAt:string; sample:boolean;
};

export const sampleSpeakers: EventSpeaker[] = [
  {id:"speaker-maya",name:"Maya Rao",role:"AI Workforce Architect",company:"AI Pod",bio:"Designs governed multi-agent operating models for enterprise teams.",photo:"",linkedin:"",expertise:["AI workforce","Agent orchestration","Governance"],sample:true},
  {id:"speaker-jordan",name:"Jordan Lee",role:"Enterprise Solutions Lead",company:"AI Pod",bio:"Maps operational objectives to measurable AI workforce deployments.",photo:"",linkedin:"",expertise:["Enterprise AI","Operations","MCP"],sample:true},
  {id:"speaker-elena",name:"Elena Martin",role:"Product Systems Lead",company:"AI Pod",bio:"Builds human approval and observability patterns for AI-enabled work.",photo:"",linkedin:"",expertise:["Product systems","Human oversight","Security"],sample:true},
];

const agenda:AgendaItem[]=[
  {time:"10:00",title:"Welcome",description:"The objective and operating context."},
  {time:"10:05",title:"AI workforce architecture",description:"Pods, specialists and control boundaries."},
  {time:"10:15",title:"Objective → Orchestrator",description:"Watch a complex objective become accountable work."},
  {time:"10:25",title:"Specialists in action",description:"Agents collaborate through governed handoffs."},
  {time:"10:35",title:"MCP execution",description:"Permissioned tools return evidence to the Pod."},
  {time:"10:40",title:"Human approval",description:"Review decisions and observable activity."},
  {time:"10:45",title:"Q&A",description:"Bring your architecture and operating questions."},
];

const base=(event:Partial<PodEvent>&Pick<PodEvent,"id"|"slug"|"title"|"type"|"status"|"startAt"|"endAt"|"topics"|"industries">):PodEvent=>({
  subtitle:"A practical AI Pod session",description:"See how specialized AI employees coordinate work, use business systems through MCP and return evidence for human review.",timezone:"Asia/Kolkata",duration:45,format:"Virtual",location:"Online",virtualUrl:"",registrationUrl:"",recordingUrl:"",thumbnail:"",heroVisual:"stage",speakerIds:["speaker-maya"],tags:["AI Pod","Enterprise AI"],agenda,learn:["How an objective becomes a governed workflow","Where MCP connections enter the process","How approvals and evidence remain visible"],audience:["Business and operations leaders","AI and transformation teams","Product, security and engineering leaders"],relatedAgents:["Workforce Orchestrator","Research Agent","Audit Agent"],integrations:["Slack","Google Drive","Salesforce"],featured:false,visibility:"PUBLIC",capacity:null,registrationCount:null,createdAt:"2026-08-01T09:00:00.000Z",updatedAt:"2026-10-08T09:00:00.000Z",sample:true,...event,
});

export const sampleEvents:PodEvent[]=[
  base({id:"evt-live-2026",slug:"ai-workforce-live-objective-to-employees",title:"AI Workforce Live: From One Objective to 20 AI Employees",subtitle:"See a governed AI workforce assemble around a real enterprise objective.",description:"AI Pod decomposes a complex business objective, assigns specialist employees, connects permissioned tools through MCP and produces a review-ready result in real time.",type:"LIVE_DEMO",status:"REGISTRATION_OPEN",startAt:"2026-10-24T04:30:00.000Z",endAt:"2026-10-24T05:15:00.000Z",topics:["AI Workforce","Agent Orchestration","MCP"],industries:["Technology","Professional Services"],featured:true,relatedAgents:["Workforce Orchestrator","Research Agent","Data Analyst","Audit Agent"],integrations:["Slack","Google Drive","Salesforce","Jira"]}),
  base({id:"evt-finance",slug:"designing-an-ai-pod-for-enterprise-finance",title:"Designing an AI Pod for Enterprise Finance",subtitle:"Research, modeling, risk and reporting in one visible workflow.",type:"LIVE_DEMO",status:"REGISTRATION_OPEN",startAt:"2026-10-28T10:30:00.000Z",endAt:"2026-10-28T11:15:00.000Z",topics:["Finance","AI Workforce","AI Governance"],industries:["Financial Services"],speakerIds:["speaker-jordan"],relatedAgents:["Finance Agent","Risk Agent","Audit Agent","Business Analyst"],integrations:["Google Sheets","Google Drive","Slack"]}),
  base({id:"evt-mcp",slug:"building-mcp-connections-for-enterprise-ai",title:"Building MCP Connections for Enterprise AI",subtitle:"A technical briefing on controlled tool access and observable execution.",type:"WEBINAR",status:"REGISTRATION_OPEN",startAt:"2026-11-05T05:30:00.000Z",endAt:"2026-11-05T06:30:00.000Z",duration:60,topics:["MCP","Enterprise AI","Security"],industries:["Technology","Professional Services"],speakerIds:["speaker-elena"],integrations:["GitHub","Jira","Slack","Google Drive"]}),
  base({id:"evt-workshop",slug:"build-your-first-ai-workforce",title:"Build Your First AI Workforce",subtitle:"A hands-on operating-model workshop for business and AI leaders.",type:"WORKSHOP",status:"REGISTRATION_OPEN",startAt:"2026-11-12T08:30:00.000Z",endAt:"2026-11-12T10:00:00.000Z",duration:90,format:"Hybrid",location:"Online + Bengaluru",topics:["AI Workforce","Business Automation","Human-in-the-loop"],industries:["Technology","E-commerce","Retail"],speakerIds:["speaker-maya","speaker-jordan"]}),
  base({id:"evt-roundtable",slug:"executive-roundtable-autonomous-operations",title:"Executive Roundtable: Autonomous Operations",subtitle:"A private discussion about control, accountability and scale.",type:"ROUNDTABLE",status:"REGISTRATION_OPEN",startAt:"2026-11-20T11:30:00.000Z",endAt:"2026-11-20T12:30:00.000Z",duration:60,format:"Virtual",topics:["Autonomous Operations","AI Governance","Enterprise AI"],industries:["Professional Services","Manufacturing","Financial Services"],speakerIds:["speaker-jordan"],capacity:30}),
  base({id:"evt-launch",slug:"ai-pod-product-session-observer",title:"Product Session: The Observer Layer",subtitle:"See how teams monitor work, evidence, approvals and exceptions.",type:"PRODUCT_EVENT",status:"REGISTRATION_OPEN",startAt:"2026-12-03T04:30:00.000Z",endAt:"2026-12-03T05:15:00.000Z",topics:["AI Automation","AI Governance","Knowledge"],industries:["Technology"],speakerIds:["speaker-elena"]}),
  base({id:"evt-past-1",slug:"ai-workforce-in-finance-2026",title:"AI Workforce in Finance",subtitle:"A leadership briefing on governed financial work.",type:"EXECUTIVE_SESSION",status:"ON_DEMAND",startAt:"2026-09-28T04:30:00.000Z",endAt:"2026-09-28T05:20:00.000Z",duration:50,format:"On Demand",location:"Recording",recordingUrl:"",topics:["Finance","AI Workforce"],industries:["Financial Services"],speakerIds:["speaker-maya"]}),
  base({id:"evt-past-2",slug:"designing-an-enterprise-ai-pod",title:"Designing an Enterprise AI Pod",subtitle:"From operating model to controlled execution.",type:"WORKSHOP",status:"ON_DEMAND",startAt:"2026-08-14T06:30:00.000Z",endAt:"2026-08-14T07:30:00.000Z",duration:60,format:"On Demand",location:"Recording",topics:["Enterprise AI","Agent Orchestration"],industries:["Technology","Professional Services"],speakerIds:["speaker-jordan"]}),
  base({id:"evt-past-3",slug:"human-approval-in-ai-operations",title:"Human Approval in AI Operations",subtitle:"Designing checkpoints that preserve speed and accountability.",type:"WEBINAR",status:"ON_DEMAND",startAt:"2025-11-06T05:30:00.000Z",endAt:"2025-11-06T06:15:00.000Z",format:"On Demand",location:"Recording",topics:["Human-in-the-loop","AI Governance"],industries:["Financial Services","Healthcare"],speakerIds:["speaker-elena"]}),
  base({id:"evt-past-4",slug:"mcp-for-business-systems",title:"MCP for Business Systems",subtitle:"A practical introduction to permissioned agent tools.",type:"WEBINAR",status:"ON_DEMAND",startAt:"2024-10-17T04:30:00.000Z",endAt:"2024-10-17T05:15:00.000Z",format:"On Demand",location:"Recording",topics:["MCP","Security"],industries:["Technology"],speakerIds:["speaker-elena"]}),
];

export const eventTypeLabel=(type:EventType)=>type.replaceAll("_"," ");
export const eventIsPast=(event:PodEvent)=>["COMPLETED","ON_DEMAND","CANCELLED"].includes(event.status)||new Date(event.endAt)<new Date();
