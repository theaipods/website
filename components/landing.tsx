"use client";

import { useState, type FormEvent } from "react";
import { btnPrimary, input } from "./ui";


export function Contact() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/contact/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "We couldn't send your request. Please try again.");
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <p className="hm-contact-success" role="status">Thanks - your interest has been sent to our team. We’ll be in touch.</p>
    );
  return (
    <>
    <div><p className="mb-4 text-sm">Or email us at <a className="font-semibold text-violet-700 underline" href="mailto:contact@theaipods.com">contact@theaipods.com</a></p><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="contact-work-email">Work email</label>
      <input id="contact-work-email" required type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="Work email" className={`${input} text-ink sm:max-w-xs`} />
      <label className="hm-contact-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></label>
      <button disabled={busy} className={`${btnPrimary} !bg-accent hover:!bg-paper hover:!text-ink disabled:cursor-wait disabled:opacity-60`}>{busy ? "Sending…" : "Contact us"}</button>
    </form></div>
    {error && <p className="hm-contact-error" role="alert">{error}</p>}
    </>
  );
}
