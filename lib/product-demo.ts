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
