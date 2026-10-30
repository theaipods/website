"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Download, ArrowUpRight, Check, FileText, X } from "lucide-react";
import campaign from "@/lib/campaign-example.json";
import "@/app/home-campaign-outputs.css";

const asset = "/campaigns/morrow/";
export const campaignTasks = [
  { action: "Extracting the brief. Checking the claims.", file: "01 / Research notes", label: "Research" },
  { action: "Turning the brief into a clear message.", file: "02 / Positioning & copy", label: "Marketing" },
  { action: "Building the launch creative.", file: "03 / Portrait ad · 1080 × 1350", label: "Design" },
  { action: "Sequencing the seven-day launch.", file: "04 / Channel calendar", label: "Social" },
  { action: "Defining what success would mean.", file: "05 / Measurement plan", label: "Analytics" },
];

export function CampaignWork({ index }: { index: number }) {
  return <div className="mc-desk" key={index}>
    <header><span><i/> {campaignTasks[index].file}</span><small>MORROW / FOCUS NOTEBOOK</small></header>
    <div className="mc-desk-body">
      <div className="mc-work-caption"><span>THE CONTRIBUTION</span><h3>{campaignTasks[index].action}</h3><p>{["Keep the supplied facts. Flag what still needs evidence.", "Give every channel the same idea to build around.", "An original creative, with a real file to review.", "Give each post a purpose, owner, and next action.", "Specify the events and comparison before launch."][index]}</p></div>
      <div className="mc-work-output">
        {index === 0 && <div className="mc-evidence">{campaign.research.map(item => <div key={item.signal}><small>{item.status}</small><p>{item.signal}</p></div>)}</div>}
        {index === 1 && <div className="mc-copy-sheet"><span>CAMPAIGN LINE / A</span><strong>{campaign.headline}</strong><p>{campaign.copy.primary}</p><small>Alternative: {campaign.copy.variant}</small></div>}
        {index === 2 && <div className="mc-design-proof"><Image src={`${asset}launch-ad.png`} alt="Original Morrow notebook launch ad: Make room for one good idea." width={1080} height={1350} sizes="220px"/><div><span className="mc-swatches"><i/><i/><i/></span><b>One idea.<br/>Room to breathe.</b><small>Portrait social creative<br/>PNG export prepared</small></div></div>}
        {index === 3 && <div className="mc-calendar">{campaign.calendar.map(item => <div key={item.day}><b>{item.day}</b><span>{item.channel}<small>{item.format}</small></span><Check size={13}/></div>)}</div>}
        {index === 4 && <div className="mc-metrics">{campaign.measurement.map(item => <div key={item.metric}><b>{item.metric}</b><code>{item.event}</code></div>)}<small>Tracking plan only · no measured results</small></div>}
      </div>
    </div>
    <footer><FileText size={13}/> This contribution becomes part of the review pack.<span>AUTHORED SAMPLE</span></footer>
  </div>;
}

function FullReport() {
  return <div className="mc-report-content">
    <section className="mc-report-cover"><div><span className="mc-label">MORROW / FOCUS NOTEBOOK</span><h2 id="campaign-report-title">Make room for<br/>one good idea.</h2><p>A complete launch concept, prepared for review.</p><p className="mc-report-disclosure">Original authored sample for a fictional product. The image is a generated product concept. This is not a live agent run or a launched campaign.</p><div className="mc-downloads"><a href={`${asset}campaign-review.pdf`} download><Download size={16}/> 6-page PDF</a><a href={`${asset}launch-ad.png`} download><Download size={16}/> Ad PNG</a><a href={`${asset}campaign-copy.txt`} download><Download size={16}/> Copy TXT</a></div></div><Image src={`${asset}launch-ad.png`} alt="Morrow original launch creative" loading="eager" width={1080} height={1350} sizes="(max-width: 600px) 75vw, 320px"/></section>
    <section><span className="mc-label">01 / RESEARCH</span><h3>A brief with boundaries.</h3><p>{campaign.brief.objective}</p><dl className="mc-brief">{Object.entries(campaign.brief).filter(([key]) => key !== "objective").map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><h4>Evidence register</h4><div className="mc-report-grid">{campaign.research.map(item => <article key={item.signal}><span className="mc-label">{item.status}</span><h4>{item.signal}</h4><p>{item.source}</p><p>{item.decision}</p></article>)}</div></section>
    <section><span className="mc-label">02 / MARKETING & DESIGN</span><h3>A message with a point of view.</h3><blockquote>{campaign.positioning}</blockquote><div className="mc-report-grid">{campaign.messagePillars.map(item => <article key={item.title}><h4>{item.title}</h4><p>{item.copy}</p></article>)}</div><h4>Primary ad copy</h4><p>{campaign.copy.primary}</p><h4>Alternative message</h4><p>{campaign.copy.variant}</p><h4>Creative specification</h4><p>1080 × 1350 portrait ad. Ivory linen, warm stone, copper detail, and generous whitespace. Headline above the product; call to action in the lower safe area. Replace the concept image with an approved production photograph for a real launch.</p></section>
    <section><span className="mc-label">03 / SOCIAL</span><h3>Seven days. A useful rhythm.</h3><div className="mc-report-schedule">{campaign.calendar.map(item => <article key={item.day}><b>{item.day}</b><div><h4>{item.channel} / {item.format}</h4><p>{item.message}</p><small>{item.owner} · {item.action}</small></div></article>)}</div><h4>Social caption</h4><p>{campaign.copy.social}</p><p>The carousel and founder post are proposed editorial directions; the portrait ad is the delivered creative. No posts are scheduled.</p></section>
    <section><span className="mc-label">04 / LAUNCH EMAIL</span><h3>A quieter place for your next idea.</h3><div className="mc-email"><small>SUBJECT</small><h4>{campaign.copy.emailSubject}</h4><small>PREVIEW: {campaign.copy.emailPreview}</small><p>{campaign.copy.emailBody}</p></div><p>Before sending, add the real product URL, sender identity, company details, and unsubscribe mechanism. Use an approved opt-in audience.</p></section>
    <section><span className="mc-label">05 / ANALYTICS</span><h3>Measure interest. Not fiction.</h3>{campaign.measurement.map(item => <article className="mc-report-metric" key={item.metric}><h4>{item.metric}</h4><code>{item.definition}</code><p>Capture: {item.event}</p><p>{item.decision}</p></article>)}<h4>Attribution example</h4><code className="mc-utm">{campaign.utm}</code><h4>Test protocol</h4><p>{campaign.analysisRule}</p></section>
    <section><span className="mc-label">06 / HUMAN REVIEW</span><h3>You decide what happens next.</h3><ol>{campaign.review.map(item => <li key={item}>{item}</li>)}</ol><p>No budget allocated. No post published. No performance results claimed.</p><a className="mc-report-pdf" href={`${asset}campaign-review.pdf`} download><Download size={16}/> Keep the full review pack</a></section>
  </div>;
}

export function CampaignPackage() {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; opener.current?.focus({ preventScroll: true }); };
  }, [open]);
  return <>
    <div className="mc-package">
      <div className="mc-package-art"><Image src={`${asset}launch-ad.png`} alt="Morrow notebook campaign ad. Make room for one good idea." width={1080} height={1350} sizes="(max-width:600px) 140px, 340px"/><a href={`${asset}launch-ad.png`} download><Download size={13}/> Save ad</a></div>
      <div className="mc-package-copy"><span className="mc-label"><Check size={12}/> YOUR CAMPAIGN PACKAGE</span><h2>One objective.<br/>Ready for your review.</h2><p className="mc-product">Morrow / Focus Notebook</p>
        <div className="mc-preview-tabs" role="group" aria-label="Preview campaign contributions">{["Creative", "Copy", "Plan"].map((label, index) => <button key={label} type="button" aria-pressed={index === tab} onClick={() => setTab(index)}>{label}</button>)}</div>
        <div className="mc-preview-content" key={tab}>{tab === 0 ? <><h3>{campaign.headline}</h3><p>A portrait ad with original art direction, a clear message, and a downloadable PNG.</p><small>1080 × 1350 · Full-size creative</small></> : tab === 1 ? <><h3>A voice, not a placeholder.</h3><p>{campaign.copy.primary}</p><small>Ad variants + social caption + launch email</small></> : <><h3>A launch you can inspect.</h3><p>Seven days, five channel moments, named owners, and three measurement definitions.</p><small>Brief → creative → calendar → human review</small></>}</div>
        <button ref={opener} type="button" className="mc-open" onClick={() => setOpen(true)}>Open the campaign <ArrowUpRight size={16}/></button><a className="mc-pdf-link" href={`${asset}campaign-review.pdf`} download><Download size={13}/> Download 6-page PDF</a><small className="mc-sample">Original sample · fictional product · not launched</small>
      </div>
    </div>
    {open && <dialog ref={dialog} className="mc-report" aria-labelledby="campaign-report-title" onCancel={() => setOpen(false)} onClick={event => { if(event.target === event.currentTarget) setOpen(false); }}><div className="mc-report-toolbar"><span>CAMPAIGN REVIEW / MORROW</span><button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close campaign report"><X size={20}/></button></div><FullReport/></dialog>}
  </>;
}
