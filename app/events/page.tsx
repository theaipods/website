import type { Metadata } from "next";
import { EventsLanding } from "@/components/EventsLanding";
import { listEvents } from "@/lib/server/events";
import "../events.css";
import "../events-redesign.css";

export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const catalog=await listEvents();return{title:"AI Pod Events | AI Workforce Events, Workshops & Live Demos",description:"Join AI Pod events, live AI workforce demonstrations, enterprise workshops and conversations about the future of AI-powered work.",alternates:{canonical:"/events"},robots:{index:catalog.events.some(event=>!event.sample),follow:true},openGraph:{title:"AI Pod Events",description:"See the AI workforce in action through live demonstrations, workshops and executive sessions.",type:"website",url:"/events"}}}
export default function EventsPage(){return <EventsLanding/>}
