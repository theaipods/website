import Link from "next/link";
import type { Metadata } from "next";
import "../events.css";

export const metadata:Metadata={title:"News & Media | TheAI Pods",description:"Company news and media updates from TheAI Pods.",alternates:{canonical:"/news"},robots:{index:false,follow:true}};
export default function NewsPage(){return <main className="events-page"><section className="ev-hero"><div className="ev-shell"><div className="ev-hero-top"><div><p>AI POD / COMPANY</p><h1>NEWS</h1></div><p>Company updates, research and media coverage will be published here as they become available.</p></div><div className="ev-conversation" style={{padding:"60px 0 0"}}><div className="ev-shell" style={{width:"100%"}}><div><small>COMING SOON</small><h2>The conversation continues.</h2><p>For now, explore live demonstrations and workshops on the Events page.</p><Link href="/events">Explore events →</Link></div></div></div></div></section></main>}
