export type Solution = {
  slug: string; title: string; category: "Department" | "Industry"; headline: string; description: string;
  accent: string; objective: string; roles: string[]; integrations: string[]; stages: string[];
  workflows: { name: string; description: string; steps: string[] }[];
};

export const solutions: Solution[] = [
  { slug:"employee-experience",title:"Employee Experience",category:"Department",headline:"Reimagine the employee experience with a coordinated AI workforce.",description:"Coordinate internal employee workflows, make approved company knowledge easier to use, and support the work across the employee lifecycle.",accent:"#b98969",objective:"More coordinated employee workflows",roles:["Employee Assistant","Employee & IT Support","Policy Assistant","People Operations"],integrations:["HRIS","Knowledge base","Help desk","Calendar"],stages:["Employee request","Policy retrieved","Task classified","Specialist assigned","Work coordinated","Human review","Task closed"],workflows:[
    {name:"Employee Assistant",description:"Prepare a new-hire handoff with the right context in one place.",steps:["New-hire context","Profile review","Training coordination","Policy documentation","Handoff preparation"]},
    {name:"Onboarding Assistant",description:"Turn a new-hire plan into visible, assignable work.",steps:["Welcome documents","Equipment & access requests","Policy discovery","Training coordination","Task tracking"]},
    {name:"Employee & IT Support",description:"Route an internal request through approved knowledge and support owners.",steps:["Question intake","Knowledge retrieval","Ticket preparation","Routing & escalation","Follow-up status"]},
    {name:"Employee development",description:"Organize development context for a manager to review.",steps:["Performance documents","Development plan draft","Feedback collation","Manager briefing","Policy check"]},
    {name:"Offboarding",description:"Prepare a controlled checklist while retaining human approval.",steps:["Checklist preparation","Asset return","Access-removal request","Documentation","Human approval"]},
  ]},
  { slug:"customer-experience",title:"Customer Experience",category:"Department",headline:"Scalable customer experience. Always-on workflows.",description:"Coordinate customer requests, retrieve relevant context, prepare responses, support approved actions, and route exceptions to the right people.",accent:"#48896d",objective:"More coordinated service",roles:["Support Specialist","Knowledge Researcher","Service Owner","Audit Agent"],integrations:["Website chat","Email","Support tickets","CRM"],stages:["Request received","Context retrieved","Classification","Action prepared","Response reviewed","Resolved or escalated"],workflows:[
    {name:"Request triage",description:"Classify a fictional customer request and gather relevant context.",steps:["Message intake","Intent identified","Account context","Relevant policy","Route to specialist"]},
    {name:"Order assistance",description:"Preview a reorder request without placing an order.",steps:["Previous order found","Item details checked","Policy reviewed","Action draft","Customer confirmation"]},
    {name:"Escalation",description:"Keep an exception visible and ready for a human owner.",steps:["Exception identified","Evidence attached","Owner assigned","Response drafted","Human decision"]},
  ]},
  { slug:"finance-operations",title:"Finance Operations",category:"Department",headline:"Finance operations, built around the outcome.",description:"Coordinate financial documents, transaction workflows, reconciliations, analysis, review, and reporting through specialized AI employees.",accent:"#3c8365",objective:"Structured finance operations",roles:["Finance Analyst","AP / AR Specialist","Reconciliation Agent","Compliance Reviewer"],integrations:["ERP","Accounting","Spreadsheets","Billing","Documents"],stages:["Document intake","Data extracted","Records matched","Exception review","Human approval","Reporting output"],workflows:[
    {name:"Quote-to-Cash Automation",description:"Prepare billing and follow-up work from approved customer context.",steps:["Customer input","Billing data","Invoice draft","Follow-up draft","Reconciliation","Reporting"]},
    {name:"Financial Intelligence Analyst",description:"Organize evidence into a reviewable financial summary.",steps:["Information intake","Structured analysis","Variance flags","Evidence summary","Management report"]},
    {name:"Accounts Payable & Receivable",description:"Surface mismatches before an authorized person decides.",steps:["Incoming documents","Extraction preview","Matching","Exception identification","Review & approval"]},
    {name:"Reconciliation & Close",description:"Track the path from records to a close summary.",steps:["Transaction records","Matching view","Differences","Review queue","Close summary"]},
    {name:"Compliance & Risk",description:"Compare a workflow against approved requirements for review.",steps:["Policy requirements","Evidence organization","Potential flags","Review queue","Decision record"]},
  ]},
  { slug:"sales-marketing",title:"Sales & Marketing",category:"Department",headline:"Turn research, relationships, and campaigns into coordinated work.",description:"Organize prospect research, account preparation, campaign workflows, content production, proposal preparation, and reporting.",accent:"#7969b5",objective:"Connected pipeline work",roles:["Research Agent","Data Analyst","Sales Agent","Campaign Specialist"],integrations:["CRM","Email","Documents","Calendar","Marketing systems"],stages:["Lead","Research","Qualified context","Strategy","Content / proposal","Human review","Follow-up draft"],workflows:[
    {name:"Prospect Research",description:"Create an evidence-led company profile.",steps:["Company profile","Relevant context","Fit indicators","Source review"]},
    {name:"Account Briefing",description:"Prepare a meeting with prior context.",steps:["Account context","Past interactions","Open questions","Meeting brief"]},
    {name:"Proposal Preparation",description:"Shape approved knowledge into a proposal draft.",steps:["Requirements","Source content","Proposal structure","Review","Draft output"]},
    {name:"Campaign Planning",description:"Plan a campaign with visible audience and asset work.",steps:["Audience research","Campaign outline","Content plan","Channel review"]},
    {name:"Content Production",description:"Move drafts through formatting and review.",steps:["Draft","Brand guidance","Channel formatting","Approval"]},
    {name:"Sales Reporting",description:"Organize pipeline data into a reviewable summary.",steps:["Pipeline input","Activity summary","Forecast input","Report draft"]},
  ]},
  { slug:"healthcare",title:"Healthcare",category:"Industry",headline:"Coordinate healthcare operations with a controlled AI workforce.",description:"Help organize administrative workflows, documentation, patient communication support, information retrieval, and operational coordination.",accent:"#4d88ac",objective:"Administrative workflow coordination",roles:["Intake Coordinator","Documentation Assistant","Communication Support","Staff Reviewer"],integrations:["Administrative systems","Documents","Scheduling","Approved knowledge"],stages:["Patient intake","Documentation","Administrative review","Communication","Scheduling","Human review","Closure"],workflows:[
    {name:"Medical Coding Assistance",description:"Prepare coding-support information for qualified staff review.",steps:["Document intake","Extraction preview","Coding-support checklist","Staff review"]},
    {name:"Patient Communication Support",description:"Draft an administrative reply for staff to review.",steps:["Question received","Permitted context","Draft response","Staff review"]},
    {name:"Medication Workflow Administration",description:"Coordinate records and follow-up tasks without clinical decisions.",steps:["Administrative request","Record verification placeholder","Follow-up task","Human verification"]},
  ]},
  { slug:"insurance",title:"Insurance",category:"Industry",headline:"Bring clarity to complex insurance workflows.",description:"Coordinate claims intake, policy work, evidence organization, customer communication drafts, and human-reviewed decisions.",accent:"#486b8f",objective:"Clearer claims and policy operations",roles:["Claims Intake Specialist","Policy Researcher","Evidence Analyst","Human Reviewer"],integrations:["Policy systems","Claims systems","Documents","CRM","Messaging"],stages:["Intake","Evidence","Policy context","Exceptions","Human decision","Communication","Record"],workflows:[
    {name:"FNOL",description:"Organize a first notice of loss for review.",steps:["Notice received","Claim details","Missing items","Intake summary","Owner routing"]},
    {name:"Quote & Underwrite",description:"Prepare information for licensed human decision-makers.",steps:["Application intake","Source checks","Information gaps","Review package","Human decision"]},
    {name:"Policy Administration",description:"Keep policy requests and documents in a visible workflow.",steps:["Request","Policy context","Change draft","Review","Record update"]},
    {name:"Claims",description:"Assemble evidence and exceptions into a reviewable claim file.",steps:["Claim received","Evidence organized","Policy context","Exception queue","Adjuster review"]},
    {name:"Settlement",description:"Prepare a settlement package without autonomous authorization.",steps:["Approved decision","Document draft","Human approval","Communication draft","Record"]},
    {name:"Command Center",description:"See work states, handoffs and pending approvals.",steps:["Open claims","Assigned owners","Exceptions","Approvals","Audit events"]},
  ]},
];

export const solutionBySlug = Object.assign(Object.create(null) as Record<string,Solution>,Object.fromEntries(solutions.map(solution=>[solution.slug,solution])));
export const solutionHref = (slug:string)=>`/solutions/${slug}`;
