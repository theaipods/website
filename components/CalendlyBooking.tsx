"use client";

import { CalendarDays,ExternalLink } from "lucide-react";
import Script from "next/script";
import { useEffect,useRef,useState } from "react";

type CalendlyWidget = { initInlineWidget: (options: { url: string; parentElement: HTMLElement; utm?: { utmSource?: string; utmContent?: string } }) => void };
declare global { interface Window { Calendly?: CalendlyWidget } }

const defaultCalendlyUrl = "https://calendly.com/contact-theaipods/30min";
const configuredUrl = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || defaultCalendlyUrl;
function calendlyUrl(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["calendly.com", "www.calendly.com"].includes(url.hostname) || url.pathname === "/") return null;
    return url.toString();
  } catch { return null; }
}

export function CalendlyBooking({ focus }: { focus: string }) {
  const url = calendlyUrl(configuredUrl);
  const host = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    if (!url || !scriptReady || !host.current || !window.Calendly) return;
    const parentElement = host.current;
    parentElement.replaceChildren();
    try {
      window.Calendly.initInlineWidget({
        url,
        parentElement,
        utm: { utmSource: "theaipods-website", utmContent: focus || "general-demo" },
      });
      setLoadError(false);
    } catch { setLoadError(true); }
    return () => parentElement.replaceChildren();
  }, [url, scriptReady, focus]);

  useEffect(() => {
    if (!url) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://calendly.com" && event.origin !== "https://www.calendly.com") return;
      if (event.data?.event === "calendly.event_scheduled") {
        setScheduled(true);
        void fetch("/api/demo/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "calendly-booking-confirmed", path: location.pathname, detail: { focus: focus || "general" } }) }).catch(() => {});
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [url, focus]);

  if (!url) return <div className="dm-calendly-setup" role="status"><CalendarDays size={30}/><h3>Demo scheduling is being connected.</h3><p>Add your Calendly event-type link as <code>NEXT_PUBLIC_CALENDLY_URL</code> in <code>web/.env.local</code>, then restart the website. The live dates and times will appear here.</p></div>;

  return <div className="dm-calendly-card">
    <div className="dm-calendly-heading"><div><span>LIVE SCHEDULING</span><h3>Choose your date and time</h3><p>Calendly shows the available slots and collects your booking details.</p></div><CalendarDays aria-hidden="true"/></div>
    {scheduled && <p className="dm-calendly-success" role="status">Calendly confirmed your meeting. Your booking details are shown in the scheduler.</p>}
    {loadError && <p className="dm-calendly-error" role="alert">The scheduler could not load here. Open the Calendly booking page directly below.</p>}
    <div ref={host} className="dm-calendly-widget" aria-label="Calendly demo scheduling interface" />
    <p className="dm-calendly-fallback">If the scheduler does not appear, <a href={url} target="_blank" rel="noopener noreferrer">open the booking page in Calendly <ExternalLink size={14}/></a>.</p>
    <Script id="calendly-embed-script" src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} onError={() => setLoadError(true)} />
  </div>;
}
