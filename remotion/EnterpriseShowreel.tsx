import { StaticEmployee } from "../components/StaticEmployee";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { registryDefinitions } from "../lib/agent-registry";

const FPS = 30;
const DURATION = 65 * FPS;
const violet = "#a997ff";
const cyan = "#8bd9f5";
const white = "#f5f7fc";
const showreelRoles = ["Pod Manager", "Finance Agent", "Audit Agent", "Research Agent", "Market Researcher", "Data Analyst", "Compliance Analyst", "Backend Developer", "Cloud Engineer", "Redaction Guard"];
const showreelCodes: Record<string,string> = { sales:"OPS",marketing:"OPS",support:"DOC",success:"OPS",hr:"OPS",it:"TECH",finance:"FIN",ops:"OPS",product:"TECH",data:"RES",legal:"LEGAL",platform:"OPS" };
const workers = showreelRoles.map(name => {
  const agent = registryDefinitions.find(a => a.name === name);
  if (!agent) throw new Error(`Showreel specialist missing from Agent Registry: ${name}`);
  return [agent.name, showreelCodes[agent.category] || "OPS"] as const;
});
const chapters = [
  { start: 0, end: 5, no: "01", label: "HUMAN OBJECTIVE", title: "One business objective.", sub: "Audit and assess Flipkart.com IPO readiness.", detail: "Financials · operations · market · valuation · risk · legal · technology · evidence" },
  { start: 5, end: 10, no: "02", label: "ORCHESTRATION", title: "The command becomes a plan.", sub: "UNDERSTAND  /  DECOMPOSE  /  PLAN  /  ASSIGN", detail: "High-level operational intent, dependencies and review points." },
  { start: 10, end: 17, no: "03", label: "DIGITAL WORKFORCE", title: "Twenty specialists. One system.", sub: "A coordinated topology forms around the orchestrator.", detail: "Each worker has a role, task, status, inputs and outputs." },
  { start: 17, end: 24, no: "04", label: "TASK ASSIGNMENT", title: "Work moves to the right specialists.", sub: "Financial analysis · research · risk · legal · valuation", detail: "Parallel execution follows explicit dependencies." },
  { start: 24, end: 35, no: "05", label: "MULTI-AGENT EXECUTION", title: "Many workstreams. One outcome.", sub: "Financials → research → risk → valuation", detail: "Source evidence moves between specialists as their work completes." },
  { start: 35, end: 40, no: "06", label: "INFORMATION FLOW", title: "Intelligence travels.", sub: "Tasks · documents · numbers · risk signals · verified evidence", detail: "The workforce collaborates through traceable handoffs." },
  { start: 40, end: 44, no: "07", label: "VALIDATION LOOP", title: "A discrepancy is found. Then resolved.", sub: "2 discrepancies detected  →  REVALIDATING  →  VERIFIED", detail: "The source is checked again before its output moves forward." },
  { start: 44, end: 48, no: "08", label: "OBSERVER", title: "The workforce stays monitored.", sub: "ISSUE DETECTED  →  DEPENDENCY RESOLVED  →  EXECUTION CONTINUES", detail: "Health, blocked tasks, quality, approvals and cost remain visible." },
  { start: 48, end: 53, no: "09", label: "SYNTHESIS", title: "The work becomes a report.", sub: "IPO DUE DILIGENCE REPORT", detail: "Ten evidence-backed sections converge into one validated deliverable." },
  { start: 53, end: 57, no: "10", label: "HUMAN CONTROL", title: "The final decision stays human.", sub: "FINAL DELIVERABLE READY", detail: "Review required before release." },
  { start: 57, end: 62, no: "11", label: "WORKFORCE RESULT", title: "Coordinated work. Clear outcome.", sub: "20 AGENTS  /  47 TASKS  /  VALIDATED OUTPUT", detail: "Illustrative operational demo values. No financial result is implied." },
  { start: 62, end: 65, no: "12", label: "AI POD", title: "BUILD YOUR AI TEAM.", sub: "GIVE IT WORK.   WATCH IT EXECUTE.", detail: "Your business. Your workforce. Powered by AI." },
] as const;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x); };

function Network({frame}:{frame:number}) {return <div style={{position:"absolute",inset:0}}>{showreelRoles.map((name,i)=>{const employee=registryDefinitions.find(a=>a.name===name);return <div key={name} style={{position:"absolute",left:350+(i%5)*230,top:250+Math.floor(i/5)*300,width:200,opacity:smooth((frame/FPS-8-i*.3)/2)}}><StaticEmployee id={employee?.id || "orchestrator"}/></div>})}</div>;}

function StatusRail({ sec }: { sec: number }) {
  const current = sec < 17 ? "ASSEMBLING" : sec < 44 ? "EXECUTING" : sec < 53 ? "VALIDATING" : sec < 55.6 ? "AWAITING APPROVAL" : sec < 57 ? "APPROVED" : "COMPLETE";
  return <div style={{position:"absolute",top:62,left:75,right:75,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:15,letterSpacing:3.5,color:"#bdc6d8"}}>
    <span style={{display:"flex",alignItems:"center",gap:12}}><span style={{width:21,height:21,transform:"rotate(45deg)",border:"3px solid #c5b9ff",boxShadow:"0 0 20px #9a86ff99"}}/> AI POD <span style={{color:"#70809b"}}>/ WORKFORCE COMMAND</span></span>
    <span style={{display:"flex",gap:25,alignItems:"center"}}><b style={{color:sec>56?"#9ce8c7":violet,fontWeight:650}}>{current}</b><span>DEMO SCENARIO</span><span style={{fontVariantNumeric:"tabular-nums"}}>{String(Math.floor(sec)).padStart(2,"0")}:65</span></span>
  </div>;
}

function Narrative({ frame }: { frame: number }) {
  const sec = frame / FPS;
  if(sec>=62) return <div style={{position:"absolute",left:90,top:245,width:960,color:white,textShadow:"0 5px 24px #02040a"}}><div style={{fontSize:19,letterSpacing:5.5,fontWeight:700,color:violet,marginBottom:28}}>AI POD / THE DIGITAL WORKFORCE</div>{["BUILD YOUR AI TEAM.","GIVE IT WORK.","WATCH IT EXECUTE."].map((line,i)=><div key={line} style={{fontSize:sec>=64&&i===2?74:61,fontWeight:700,letterSpacing:-3.3,lineHeight:1.13,opacity:smooth((sec-62-i*.63)/.37),transform:`translateX(${(1-smooth((sec-62-i*.63)/.37))*-22}px)`,color:i===2?"#bcb0ff":white}}>{line}</div>)}<div style={{marginTop:31,fontSize:18,letterSpacing:4,color:"#b7c4dc",opacity:smooth((sec-63.8)/.35)}}>AI POD&nbsp;&nbsp; / &nbsp;&nbsp;YOUR BUSINESS. YOUR WORKFORCE. POWERED BY AI.</div></div>;
  const chapter = chapters.find(c=>sec>=c.start&&sec<c.end) ?? chapters[chapters.length-1];
  const local = sec-chapter.start;
  const fade = (sec < 5 ? .78+.22*smooth(local/.6) : smooth(local/.6))*smooth((chapter.end-sec)/.45);
  return <div style={{position:"absolute",left:90,top:250,width:875,opacity:fade,transform:`translate3d(${(1-fade)*-50}px,${(1-fade)*16}px,0)`,color:white,textShadow:"0 4px 22px #060a14"}}>
    <div style={{fontSize:20,letterSpacing:5.5,fontWeight:700,color:violet,marginBottom:30}}>{chapter.no} / {chapter.label}</div>
    <h1 style={{fontSize:sec>=62?76:70,lineHeight:1.04,letterSpacing:-3.7,fontWeight:650,margin:"0 0 30px",maxWidth:825}}>{chapter.title}</h1>
    <p style={{fontSize:29,lineHeight:1.35,color:"#dce4f2",margin:"0 0 26px",maxWidth:770,fontWeight:450}}>{chapter.sub}</p>
    <p style={{fontSize:18,lineHeight:1.55,color:"#a2afc5",maxWidth:710,margin:0}}>{chapter.detail}</p>
  </div>;
}

function DetailPanels({ frame }: { frame: number }) {
  const sec=frame/FPS;
  const block=(title:string,lines:string[],accent=cyan)=><div style={{position:"absolute",right:85,bottom:130,width:465,padding:"22px 26px",background:"#101927e6",border:"1px solid #6578956b",borderLeft:`3px solid ${accent}`,boxShadow:"0 28px 90px #01040b99",backdropFilter:"blur(15px)",color:white}}><div style={{fontSize:13,letterSpacing:2.8,color:accent,fontWeight:750,marginBottom:13}}>{title}</div>{lines.map((line,i)=><div key={line} style={{display:"flex",justifyContent:"space-between",gap:20,padding:"8px 0",borderTop:i?"1px solid #ffffff1a":undefined,fontSize:16,color:"#dce5f2"}}><span>{line}</span><span style={{color:accent}}>●</span></div>)}</div>;
  if(sec>=10&&sec<17){
    const batch=Math.min(3,Math.floor((sec-10)/1.75));
    return block(`WORKFORCE / SPECIALISTS ${String(batch*5+1).padStart(2,"0")}-${String(batch*5+5).padStart(2,"0")}`,workers.slice(batch*5,batch*5+5).map(([role],i)=>`${role} · ${batch===0&&i===0?"PLANNING":i%3===0?"WAITING": "ASSIGNED"}`));
  }
  if(sec>=17&&sec<24) return block("DEPENDENCY GRAPH",["Finance review → Audit","Compliance review → Risk analysis","Data validation → QA","Human review → Delivery"]);
  if(sec>=24&&sec<27.5) return block("FINANCIAL ANALYST / ANALYZING",["PDF · XLSX · CSV received","Revenue · EBITDA · cash flow","Evidence package → Valuation"]);
  if(sec>=27.5&&sec<30) return block("RESEARCH / EVIDENCE",["Company knowledge","Market position · competition","Source package → Risk"]);
  if(sec>=30&&sec<32.5) return block("RISK ANALYSIS / MATRIX",["Financial · regulatory","Operational · technology","Governance · market"],"#e5b999");
  if(sec>=32.5&&sec<35) return block("VALUATION / MODEL",["Financial inputs received","Sensitivity analysis in progress","Reviewed package → Reporting"]);
  if(sec>=40&&sec<44) return block("VALIDATION / RETURN PATH",["2 discrepancies detected","Source recheck requested","Evidence VERIFIED"],"#e5b999");
  if(sec>=44&&sec<48) return block("OBSERVER / WORKFORCE HEALTH",["18 active · 1 waiting · 1 blocked","Blocked task rerouted","Execution continues"],"#e5b999");
  if(sec>=48&&sec<53) return block("DUE DILIGENCE REPORT / VALIDATED",["Financial · business · market","Risk · legal · technology","Governance · evidence · recommendations"]);
  if(sec>=53&&sec<57) return <div style={{position:"absolute",right:85,bottom:125,width:510,padding:"30px 31px",background:"#101927f2",border:"1px solid #91b2c477",boxShadow:"0 28px 90px #01040bba",color:white}}><div style={{fontSize:14,letterSpacing:3,color:"#a9e7c8",fontWeight:750}}>FINAL CONTROL POINT / DEMO</div><h2 style={{fontSize:30,letterSpacing:-1,margin:"21px 0 10px"}}>Board-ready report</h2><p style={{fontSize:16,color:"#b5c3d5",margin:"0 0 25px"}}>Validated outputs · human review required</p><div style={{display:"flex",gap:11}}>{["APPROVE","REQUEST CHANGES","REJECT"].map((label,i)=><div key={label} style={{padding:"12px 13px",fontSize:12,fontWeight:800,letterSpacing:.8,border:i===0?"1px solid #a9e7c8":"1px solid #516078",background:i===0&&sec>55.4?"#a9e7c8":i===0?"#a9e7c822":"transparent",color:i===0&&sec>55.4?"#0b1b18":"#d9e5f1",boxShadow:i===0&&sec>55.4?"0 0 25px #a9e7c899":undefined}}>{label}</div>)}</div>{sec>55.5&&<p style={{color:"#a9e7c8",fontSize:14,letterSpacing:1.5,margin:"20px 0 0"}}>✓ APPROVAL RECORDED · EXECUTION COMPLETE</p>}</div>;
  if(sec>=57&&sec<62) return block("OPERATIONAL DEMO RESULT",["20 agents · 47 tasks","Multi-agent collaboration","Human approval recorded"],"#a9e7c8");
  return null;
}

export function EnterpriseShowreel() {
  const frame=useCurrentFrame(), sec=frame/FPS;
  const scan=(frame*1.8)%1080;
  const endFade=smooth((65-sec)/.4);
  return <AbsoluteFill style={{background:"#060910",overflow:"hidden"}}><div style={{position:"absolute",width:1920,height:1080,transform:"scale(2)",transformOrigin:"top left",background:"radial-gradient(circle at 65% 48%,#172133 0,#0c111d 49%,#060910 100%)",fontFamily:"Satoshi, Inter, Arial, sans-serif",overflow:"hidden",opacity:endFade}}>
    <div style={{position:"absolute",inset:0,opacity:.42,backgroundImage:"linear-gradient(#7f96bd12 1px,transparent 1px),linear-gradient(90deg,#7f96bd12 1px,transparent 1px)",backgroundSize:"75px 75px",transform:`perspective(800px) rotateX(38deg) translateY(${frame*.18}px) scale(1.3)`}}/>
    <Network frame={frame}/>
    <div style={{position:"absolute",left:780,top:355,width:390}}><StaticEmployee id="orchestrator"/></div>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,#060910f0 0%,#080d17c7 25%,transparent 61%),linear-gradient(0deg,#050811ee,transparent 28%)"}}/>
    <div style={{position:"absolute",top:scan,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#c6c8ff25,transparent)"}}/>
    <StatusRail sec={sec}/><Narrative frame={frame}/><DetailPanels frame={frame}/>
    {sec<5&&<div style={{position:"absolute",left:90,bottom:150,color:"#b9c6d8",fontSize:16,letterSpacing:2,opacity:smooth((sec-1)/1.2)}}>OBJECTIVE RECEIVED <span style={{color:violet,marginLeft:30}}>UNDERSTANDING SCOPE</span></div>}
    <div style={{position:"absolute",bottom:58,left:85,right:85,display:"flex",alignItems:"center",gap:18,color:"#8491aa",fontSize:13,letterSpacing:2.3}}><span>AI POD / FICTIONAL ENTERPRISE DEMONSTRATION</span><span style={{flex:1,height:1,background:"#57637777"}}/><span>ILLUSTRATIVE · NOT A REAL ENGAGEMENT</span></div>
    <div style={{position:"absolute",bottom:0,left:0,height:4,width:`${(frame/DURATION)*100}%`,background:"linear-gradient(90deg,#718ed0,#b89dff)",boxShadow:"0 0 18px #9f8dff"}}/>
    <Audio src={staticFile("showreel/enterprise-score.wav")}/>
  </div></AbsoluteFill>;
}
