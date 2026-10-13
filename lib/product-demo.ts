export const productScenes = [
  { title: "Objective & orchestration", eyebrow: "01 / PLAN", description: "A fictional retailer asks for a due-diligence report. The Orchestrator lays out the work and review points.", stages: ["Objective received", "Execution plan created", "Specialists selected", "Approval points marked"] },
  { title: "Agent execution", eyebrow: "02 / WORK", description: "Finance, research and risk specialists prepare separate workstreams and hand findings to quality review.", stages: ["Finance Agent assigned", "Research Agent assigned", "Risk Agent assigned", "Workstreams coordinated"] },
  { title: "MCP & integrations", eyebrow: "03 / CONNECT", description: "The sample Pod requests approved information through a governed tool layer. No external system is connected in this preview.", stages: ["Tool request prepared", "Permission checked", "Sample response shown", "Source attached"] },
  { title: "Validation & deliverables", eyebrow: "04 / DELIVER", description: "Quality checks the evidence and a reviewer receives a structured report before anything is finalized.", stages: ["Evidence checked", "Draft assembled", "Human review requested", "Report ready for review"] },
];

export const lifecycle = [
  { key: "Plan", title: "The objective becomes a plan", detail: "The Orchestrator turns a business request into scoped workstreams and review points.", focus: ["Objective received", "Finance workstream", "Research workstream", "Risk workstream"] },
  { key: "Assign", title: "The right specialists take ownership", detail: "Distinct employees receive responsibilities, context and the tools relevant to their work.", focus: ["Finance Agent assigned", "Research Agent assigned", "Risk Agent assigned", "Quality Agent queued"] },
  { key: "Execute", title: "Work moves across the Pod", detail: "Tasks progress with visible dependencies and handoffs between specialists.", focus: ["Sources gathered", "Financials reviewed", "Risk signals compared", "Draft in progress"] },
  { key: "Validate", title: "Checks happen before delivery", detail: "Evidence, outputs and approvals are visible before the report is released.", focus: ["Evidence checked", "Claims reviewed", "Human approval needed", "Audit activity recorded"] },
  { key: "Deliver", title: "A review-ready output emerges", detail: "Coordinated work becomes a structured business deliverable.", focus: ["Executive summary", "Findings", "Risks", "Reviewer notes"] },
];

export const capabilityGroups = [
  { title: "Build & orchestrate", summary: "Give objectives a team and an operating plan.", items: ["AI Pods", "Orchestrator / Pod Manager", "Task Planner", "Agent Assignment", "Dependency Management", "Cross-Agent Collaboration"], example: "Turn a due-diligence request into finance, research and risk workstreams.", href: "/onboarding" },
  { title: "Execute & deliver", summary: "Follow tasks from first action to a usable output.", items: ["Task Execution", "Project Tracking", "Tool Execution", "Document Generation", "Structured Deliverables", "Completion Reporting"], example: "Prepare a report with findings, sources and reviewer notes.", href: "/workspace" },
  { title: "Connect & understand", summary: "Bring approved tools and company context into the work.", items: ["Integrations", "MCP", "Tool Registry", "Company Knowledge", "Context Retrieval", "Model-Provider Abstraction"], example: "Retrieve permitted policy documents for a specialist task.", href: "/integrations" },
  { title: "Govern & monitor", summary: "Keep permissions, progress and review in view.", items: ["Human Approvals", "Permissions", "Audit Activity", "Workforce Observer", "Performance Metrics", "Cost Visibility"], example: "Pause before a high-impact action and send it to a human reviewer.", href: "/workspace/approvals" },
];

export type ProductRole = { name: string; specialization: string; responsibility: string; input: string; output: string; tool: string };
const roleRows = (rows: string[][]): ProductRole[] => rows.map(([name,specialization,responsibility,input,output,tool]) => ({name,specialization,responsibility,input,output,tool}));
export const roleGroups: { title: string; roles: ProductRole[] }[] = [
  { title: "Finance & risk", roles: roleRows([
    ["Finance Agent","Financial review","Examine statements and trends","Financial reports","Finding summary","Spreadsheets"],
    ["Audit Agent","Evidence review","Trace figures to source material","Records and policies","Evidence checklist","Documents"],
    ["Scenario Planning Agent","Scenario planning","Prepare assumptions and scenarios","Operating data","Scenario model","Spreadsheets"],
    ["Finance Agent","Financial analysis","Organize financial inputs","Financial statements","Financial brief","Spreadsheets"],
    ["Audit Agent","Evidence assessment","Identify and classify evidence gaps","Reports and policies","Evidence register","Knowledge"],
    ["Finance Operations Agent","Finance operations","Coordinate recurring finance work","Transactions","Work summary","ERP"]
  ]) },
  { title: "Research & intelligence", roles: roleRows([
    ["Company Research Agent","Company context","Gather public and approved context","Company profile","Research brief","Web search"],
    ["Market Research Agent","Market landscape","Compare markets and sources","Market reports","Market summary","Documents"],
    ["Market Research Agent","Market analysis","Structure market differences","Public information","Comparison matrix","Web search"],
    ["Knowledge Retrieval Agent","Internal context","Locate permitted company knowledge","SOPs and policies","Context packet","Knowledge"],
    ["Document Intelligence Agent","Document analysis","Extract relevant points from files","Uploaded documents","Evidence summary","Documents"]
  ]) },
  { title: "Sales & customer operations", roles: roleRows([
    ["Sales Agent","Sales workflow","Prepare outreach and follow-up","Lead context","Draft outreach","CRM"],
    ["Sales Agent","Account research","Summarize account signals","CRM records","Account brief","CRM"],
    ["Support Workflow Agent","Support workflow","Organize service follow-up","Support request","Response draft","Helpdesk"],
    ["Customer Success Agent","Customer health","Organize adoption and renewal work","Account activity","Success plan","CRM"],
    ["Sales Operations Agent","Pipeline operations","Coordinate pipeline hygiene","Pipeline data","Ops summary","CRM"]
  ]) },
  { title: "Marketing & growth", roles: roleRows([
    ["Marketing Agent","Campaign planning","Turn a brief into a campaign plan","Campaign brief","Launch plan","Workspace"],
    ["SEO Agent","Search strategy","Review search opportunities","Site content","SEO brief","Analytics"],
    ["Content Agent","Content production","Prepare a reviewed draft","Brand guide","Content draft","Documents"],
    ["Social Media Agent","Channel planning","Adapt content for channels","Approved copy","Post drafts","Social tools"],
    ["Marketing Analytics Agent","Performance review","Organize campaign results","Campaign data","Performance summary","Analytics"]
  ]) },
  { title: "Engineering & product", roles: roleRows([
    ["Product Manager Agent","Product discovery","Organize requirements and priorities","Customer feedback","Product brief","Issue tracker"],
    ["UI/UX Designer Agent","Experience design","Translate needs into interface concepts","Product brief","Design concept","Figma"],
    ["Frontend Developer Agent","Interface work","Prepare scoped frontend changes","Design spec","Code proposal","GitHub"],
    ["Backend Developer Agent","Service work","Prepare scoped service changes","Technical spec","Code proposal","GitHub"],
    ["QA Engineer Agent","Quality checks","Review expected behavior and defects","Acceptance criteria","QA report","Issue tracker"],
    ["DevOps Agent","Delivery operations","Review deployment requirements","Build status","Release checklist","CI tools"],
    ["Cloud Engineer Agent","Infrastructure","Review cloud configuration needs","Architecture","Infrastructure plan","Cloud tools"],
    ["Security Agent","Security review","Surface permissions and risk points","System context","Review findings","Security tools"]
  ]) },
  { title: "Business operations", roles: roleRows([
    ["Business Analyst Agent","Process analysis","Map current and proposed work","Process notes","Process map","Documents"],
    ["Project Manager Agent","Coordination","Track owners and dependencies","Task plan","Status brief","Project tools"],
    ["Operations Agent","Operations","Organize repeatable workflows","SOPs","Work plan","Workspace"],
    ["HR Agent","People operations","Prepare policy-aware drafts","HR policies","Draft response","Knowledge"],
    ["Employee Assistant","People operations","Structure employee onboarding work","Role brief","Review summary","ATS"],
    ["Reporting Agent","Reporting","Assemble findings into a clear output","Validated findings","Business report","Documents"]
  ]) },
];

export const integrationExamples = [
  { name:"Google Drive",tool:"drive.files.list",type:"Document source",agent:"Research Agent" },
  { name:"Slack",tool:"slack.search",type:"Communication",agent:"Operations Agent" },
  { name:"Salesforce",tool:"salesforce.query",type:"CRM",agent:"Sales Agent" },
  { name:"GitHub",tool:"github.issues.list",type:"Engineering",agent:"Product Manager Agent" },
  { name:"Jira",tool:"jira.issue.search",type:"Project work",agent:"QA Engineer Agent" },
  { name:"Notion",tool:"notion.search",type:"Knowledge source",agent:"Knowledge Retrieval Agent" },
  { name:"PostgreSQL",tool:"postgres.query",type:"Data source",agent:"Finance Agent" },
  { name:"Google Sheets",tool:"sheets.read",type:"Spreadsheet",agent:"Finance Agent" },
  { name:"Microsoft Teams",tool:"teams.search",type:"Communication",agent:"Operations Agent" },
  { name:"Custom MCP",tool:"custom.tool",type:"Custom server",agent:"Business Analyst Agent" },
];

export const knowledgeSources = [
  { name:"Documents",example:"Fictional company brief",permissions:"Approved project access",roles:"Research · Reporting" },
  { name:"Policies",example:"Sample approval policy",permissions:"Policy-scoped access",roles:"Legal · Operations" },
  { name:"SOPs",example:"Sample process guide",permissions:"Team-scoped access",roles:"Operations · Quality" },
  { name:"Spreadsheets",example:"Demo financial workbook",permissions:"Finance-scoped access",roles:"Finance · Risk" },
  { name:"Product docs",example:"Sample product spec",permissions:"Product-scoped access",roles:"Product · Engineering" },
  { name:"Research",example:"Fictional market notes",permissions:"Approved project access",roles:"Research · Marketing" },
  { name:"URLs",example:"Public company pages",permissions:"Public source",roles:"Research · Sales" },
];

export const deliverableExamples = [
  { name:"Report",title:"Retail diligence report",sections:["Executive summary","Financial observations","Risk register","Sources & reviewer notes"] },
  { name:"Spreadsheet",title:"Financial review workbook",sections:["Revenue trends","Cost assumptions","Scenario notes","Source references"] },
  { name:"Presentation",title:"Board review deck",sections:["Decision context","Market landscape","Key risks","Recommended next steps"] },
  { name:"Analysis",title:"Competitive analysis",sections:["Competitor set","Capability matrix","Evidence","Interpretation"] },
  { name:"Recommendation",title:"Proposed action brief",sections:["Objective","Options considered","Trade-offs","Approval request"] },
];

export const productFaq = [
  ["What is AI Pod?","AI Pod is a platform for assembling specialized AI employees into coordinated teams around business objectives."],
  ["What is an AI Pod?","A Pod is a purpose-built group of AI specialists, tasks, tools and human review points for a particular objective."],
  ["How is an AI employee different from a chatbot?","An AI employee has a defined role in a workflow, with responsibilities, tools, context and review rules."],
  ["How does the Orchestrator assign work?","The Orchestrator is designed to break an objective into tasks, dependencies and specialist assignments."],
  ["Can AI employees collaborate?","The platform is designed for specialists to hand work and context between one another within a Pod."],
  ["Can the workforce use external tools?","Tool access depends on configured integrations, permissions and availability. The examples here are illustrative."],
  ["What is MCP?","Model Context Protocol is a way to expose tools and context to AI systems. AI Pod includes an MCP connectivity layer."],
  ["Can agents access company knowledge?","Approved company information can be made available according to the permissions and configuration of a Pod."],
  ["Can high-impact actions require human approval?","Yes. Approval points can keep people involved before selected actions continue."],
  ["How do I observe the workforce?","Workspace views show tasks, states, dependencies, activity and deliverables."],
  ["Can a Pod produce structured deliverables?","Pods can organize work into outputs such as reports, analyses and other structured artifacts, subject to review."],
  ["Is AI Pod tied to one model provider?","The application architecture supports a provider abstraction. Availability depends on configured providers."],
  ["Can I configure multiple Pods?","The workspace is designed to organize multiple Pods around different objectives."],
  ["Can I see a demonstration?","Yes. Open the interactive preview on this page or book a product demonstration."],
];
