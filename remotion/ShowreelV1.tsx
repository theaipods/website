import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";

const white = "#1b2140";
const lilac = "#7654be";
const panel = { background: "linear-gradient(145deg,#ffffff,#f0ebfa)", border: "1px solid #d8cde9", borderRadius: 24, boxShadow: "0 28px 70px #5b467633" } as const;

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 73% 34%,#e5dcfc 0%,#f9f7fd 46%,#ffffff 100%)", color: white, fontFamily: "Satoshi, Inter, Arial, sans-serif", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 48, border: "1px solid #cfc4e3", borderRadius: 22 }} />
    <div style={{ position: "absolute", top: 75, left: 88, color: lilac, fontSize: 24, fontWeight: 700, letterSpacing: 5 }}>{label}</div>
    <div style={{ position: "absolute", top: 75, right: 88, fontSize: 23, color: "#817b9d" }}>THEAIPODS / 01</div>
    {children}
    <div style={{position:"absolute",right:38,bottom:36,width:300,height:350,borderRadius:25,overflow:"hidden",background:"linear-gradient(150deg,#eee7fc,#c9b8ed)",border:"2px solid #d5c5ed",boxShadow:"0 22px 55px #3d28734f",transform:`translateY(${Math.sin(frame/13)*3}px)`}}>
      <div role="img" aria-label="Woman presenter guiding the film" style={{position:"absolute",inset:0,backgroundImage:`url(${staticFile("brand/showreel-presenter.png")})`,backgroundSize:"auto 430px",backgroundPosition:"center top",backgroundRepeat:"no-repeat"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"13px 16px",background:"linear-gradient(90deg,#211a53ee,#5b4395ed)",color:"white",display:"flex",alignItems:"center",gap:11,fontSize:14,fontWeight:750,letterSpacing:1.4}}><span>YOUR GUIDE</span><span style={{display:"flex",alignItems:"center",gap:3,marginLeft:"auto"}}>{[0,1,2,3,4].map(i=><i key={i} style={{display:"block",width:3,height:7+Math.abs(Math.sin(frame/5+i))*17,background:"#d9c6ff",borderRadius:3}}/>)}</span></div>
    </div>
    <div style={{ position: "absolute", bottom: 77, left: 90, display: "flex", gap: 10 }}>{[0,1,2,3].map(i=><span key={i} style={{ width: i===0?62:23, height: 5, borderRadius: 8, background: i===0?"#946ee3":"#d1c9e1" }} />)}</div>
  </AbsoluteFill>;
}

function GlassCore({ frame }: { frame: number }) {
  return <div style={{ position: "absolute", right: 175, top: 220, width: 470, height: 470, perspective: 900 }}>
    <div style={{ position: "absolute", inset: 55, borderRadius: 76, background: "linear-gradient(145deg,#bfaaff,#443b98 48%,#151a47)", border: "2px solid #e4ceff99", boxShadow: "-30px 34px 90px #6849d377, inset 18px 18px 38px #ffffff44, inset -24px -28px 45px #02031299", rotate: `${interpolate(frame,[0,150],[-17,18],{extrapolateRight:"clamp"})}deg`, scale: interpolate(frame,[0,34],[0.66,1],{extrapolateRight:"clamp",easing:Easing.bezier(.2,.9,.2,1)}) }} />
    <div style={{ position: "absolute", left: 155, top: 145, width: 160, height: 160, borderRadius: 38, border: "2px solid #ffffffa0", background: "linear-gradient(135deg,#d9d0ff,#937de3 40%,#34347d)", boxShadow: "0 20px 42px #141042aa, inset 12px 12px 20px #fff7", rotate: "-14deg" }} />
    <div style={{ position: "absolute", left: 220, top: 205, width: 30, height: 30, borderRadius: 50, background: "#ecdeff", boxShadow: "0 0 44px 18px #aa84ff" }} />
  </div>;
}

function OpeningScene() {
  const frame=useCurrentFrame();
  return <Frame label="01 / THE OBJECTIVE"><div style={{ position:"absolute",left:110,top:285,width:840,opacity:interpolate(frame,[0,25],[0,1],{extrapolateRight:"clamp"}),translate:`0 ${interpolate(frame,[0,25],[35,0],{extrapolateRight:"clamp"})}px` }}><div style={{ color:lilac,fontSize:28,letterSpacing:3,marginBottom:34 }}>ONE CLEAR OUTCOME</div><div style={{ fontSize:95,fontWeight:700,lineHeight:1.05,letterSpacing:-5 }}>Tell us what<br/><span style={{ color:"#b998ff" }}>needs to happen.</span></div><p style={{fontSize:33,color:"#6a718c",marginTop:46,lineHeight:1.45}}>A business objective becomes a coordinated plan.</p></div><GlassCore frame={frame}/></Frame>;
}

function PlanScene() {
  const frame=useCurrentFrame();
  return <Frame label="02 / THE PLAN"><div style={{position:"absolute",left:105,top:160,fontSize:72,fontWeight:700,letterSpacing:-3}}>From goal to workflow.</div><div style={{position:"absolute",left:105,top:290,width:1430,display:"flex",gap:26}}>{[
    ["01","Understand","Company context + approved sources"],
    ["02","Plan","Owners, tools and human decisions"],
    ["03","Assign","Specialists matched to each step"],
  ].map(([n,title,desc],i)=><div key={n} style={{...panel,flex:1,padding:42,minHeight:350,opacity:interpolate(frame,[12+i*20,33+i*20],[0,1],{extrapolateRight:"clamp"}),translate:`0 ${interpolate(frame,[12+i*20,33+i*20],[50,0],{extrapolateRight:"clamp"})}px`}}><div style={{fontSize:29,color:lilac,marginBottom:55}}>{n}</div><div style={{height:64,width:64,background:"linear-gradient(145deg,#d8c7ff,#5147a8)",borderRadius:17,boxShadow:"11px 14px 30px #674ecc66,inset 5px 5px 14px #fff9",marginBottom:35,rotate:"-12deg"}}/><div style={{fontSize:40,fontWeight:650}}>{title}</div><div style={{fontSize:25,color:"#727890",lineHeight:1.45,marginTop:20}}>{desc}</div></div>)}</div></Frame>;
}

function WorkforceScene() {
  const frame=useCurrentFrame();
  return <Frame label="03 / THE WORKFORCE"><div style={{position:"absolute",left:105,top:160,fontSize:72,fontWeight:700,letterSpacing:-3}}>Specialists work together.</div><div style={{position:"absolute",left:115,top:320,display:"flex",gap:24}}>{[
    ["R","Research","Evidence gathered"],["C","Create","Drafts prepared"],["Q","Quality","Claims checked"],["H","You","Approval gate"],
  ].map(([initial,title,status],i)=><div key={title} style={{...panel,width:335,height:385,padding:34,opacity:interpolate(frame,[i*18,i*18+22],[0,1],{extrapolateRight:"clamp"}),scale:interpolate(frame,[i*18,i*18+22],[.83,1],{extrapolateRight:"clamp"})}}><div style={{height:143,width:143,borderRadius:35,background:i===3?"linear-gradient(145deg,#f5f1ff,#8685b6)":"linear-gradient(145deg,#c9bbff,#6354d1 52%,#24215a)",boxShadow:"12px 18px 30px #34298e88,inset 8px 8px 16px #ffffff80",display:"grid",placeItems:"center",fontSize:74,fontWeight:750,color:i===3?"#272447":"white",rotate:"-10deg"}}>{initial}</div><div style={{fontSize:36,fontWeight:650,marginTop:39}}>{title}</div><div style={{fontSize:24,color:"#727890",marginTop:18}}>{status}</div></div>)}</div></Frame>;
}

function OutcomeScene() {
  const frame=useCurrentFrame();
  return <Frame label="04 / THE RESULT"><div style={{position:"absolute",left:105,top:155,fontSize:75,fontWeight:700,letterSpacing:-3}}>Review the work. Then ship.</div><div style={{position:"absolute",left:115,top:305,width:990,...panel,padding:42,opacity:interpolate(frame,[0,26],[0,1],{extrapolateRight:"clamp"})}}><div style={{color:lilac,fontSize:24,letterSpacing:3}}>DELIVERABLE / READY FOR YOUR REVIEW</div><div style={{fontSize:48,fontWeight:650,marginTop:34}}>Campaign launch brief</div><div style={{height:13,width:"87%",borderRadius:8,background:"#dcd5e8",marginTop:55}}/><div style={{height:13,width:"69%",borderRadius:8,background:"#dcd5e8",marginTop:20}}/><div style={{height:13,width:"77%",borderRadius:8,background:"#dcd5e8",marginTop:20}}/><div style={{marginTop:62,display:"inline-block",background:"#8669d2",color:"#ffffff",padding:"20px 32px",fontSize:27,fontWeight:700,borderRadius:100}}>Approve when ready →</div></div><GlassCore frame={frame}/></Frame>;
}

export function WorkforceShowreel() {
  return <AbsoluteFill><Sequence from={0} durationInFrames={150} name="The objective"><OpeningScene/><Audio src={staticFile("voiceover/scene-1.wav")}/></Sequence><Sequence from={150} durationInFrames={150} name="The plan"><PlanScene/><Audio src={staticFile("voiceover/scene-2.wav")}/></Sequence><Sequence from={300} durationInFrames={150} name="The workforce"><WorkforceScene/><Audio src={staticFile("voiceover/scene-3.wav")}/></Sequence><Sequence from={450} durationInFrames={150} name="The result"><OutcomeScene/><Audio src={staticFile("voiceover/scene-4.wav")}/></Sequence></AbsoluteFill>;
}
