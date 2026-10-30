"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mail, X, Check, ShieldCheck, ArrowRight } from "lucide-react";
import { Logo } from "./ui";
import { api, usePlatform } from "./platform-context";
import { Button, Heading, Notice } from "./platform-ui";
import { isCompanyEmail, companyEmailMessage } from "@/lib/company-email";
import "@/app/account-auth.css";

type Mode = "login" | "register" | "reset" | "verify" | "password";
export function Account({ reset = false }: { reset?: boolean }) {
  const s = usePlatform(); const router = useRouter();
  const [mode, setMode] = useState<Mode>(reset ? "reset" : "login");
  const [purpose, setPurpose] = useState<"signup" | "reset">(reset ? "reset" : "signup");
  const [portal, setPortal] = useState<"owner" | "admin">("owner");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(""); const [name, setName] = useState("");
  const [code, setCode] = useState(""); const [challengeId, setChallengeId] = useState("");
  const [grant, setGrant] = useState(""); const [error, setError] = useState("");
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const [entering, setEntering] = useState(false); const [errorVersion, setErrorVersion] = useState(0);
  const [resendAt, setResendAt] = useState(0); const [remaining, setRemaining] = useState(0);
  const title = useRef<HTMLHeadingElement>(null);
  const enteringRef = useRef(false);
  useEffect(() => {
    if (s.ready && s.user && !enteringRef.current && !reset) router.replace(s.user.role === "admin" ? "/admin" : s.companies.some(c => c.status === "active") ? "/workspace" : "/welcome");
  }, [s.ready, s.user, s.companies, router, reset]);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [mode]);
  useEffect(() => {
    if (!resendAt) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [resendAt]);
  function switchMode(next: Mode) {
    setMode(next); setError(""); setMessage(""); setPassword(""); setConfirm(""); setCode(""); setGrant("");
    if (next === "reset" || next === "register") setPurpose(next === "reset" ? "reset" : "signup");
  }
  async function enter() {
    enteringRef.current = true; setEntering(true);
    const session = await api<{ user: { role: string } | null }>("auth/session");
    await s.refresh();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) await new Promise(resolve => setTimeout(resolve, 450));
    router.replace(session.user?.role === "admin" ? "/admin" : "/welcome");
  }
  async function submit(resend = false) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const normalized = email.trim().toLowerCase();
      if (!isCompanyEmail(normalized)) throw new Error(companyEmailMessage);
      setEmail(normalized);
      if (resend || mode === "register" || mode === "reset") {
        const r = await api<{ challengeId: string; message: string }>(resend ? "auth/resend" : mode === "reset" ? "auth/password-reset" : "auth/register", "POST", { email: normalized, purpose });
        setChallengeId(r.challengeId); setCode(""); setMessage(r.message); setResendAt(Date.now() + 60000); setMode("verify"); return;
      }
      if (mode === "verify") {
        if (!/^\d{6}$/.test(code)) throw new Error("Enter the six-digit code from your email.");
        const r = await api<{ grant: string }>("auth/verify", "POST", { email: normalized, purpose, challengeId, code });
        setGrant(r.grant); setCode(""); setPassword(""); setConfirm(""); setMode("password"); return;
      }
      if (mode === "password") {
        if (password.length < 10) throw new Error("Choose a password with at least 10 characters.");
        if (password !== confirm) throw new Error("Your passwords don't match. Please try again.");
        await api(purpose === "reset" ? "auth/reset-password" : "auth/complete-signup", "POST", { email: normalized, grant, password, ...(purpose === "signup" ? { name } : {}) });
        setGrant(""); setPassword(""); setConfirm("");
        if (purpose === "reset") { await s.refresh(); setMode("login"); setMessage("Password changed. All previous sessions are signed out. Log in with your new password."); return; }
      } else {
        await api("auth/login", "POST", { email: normalized, password, portal });
      }
      await enter();
    } catch (e) { setError((e as Error).message); setErrorVersion(v => v + 1); enteringRef.current = false; setEntering(false); }
    finally { setBusy(false); }
  }
  const heading = mode === "login" ? "Welcome back." : mode === "register" ? "Start with your work email." : mode === "reset" ? "A fresh start, securely." : mode === "verify" ? "Check your inbox." : purpose === "reset" ? "Choose a new password." : "Make yourself at home.";
  return <main className={`wf-auth auth-account${entering ? " auth-entering" : ""}`}>
    <section className="wf-auth-story"><Logo /><div><p className="wf-eyebrow">Your business. Your workforce.</p><h1>Teach it once.<br />Give it an outcome.<br /><span>Build from there.</span></h1><p>Company knowledge, specialist teams and clear human decisions - all in one place.</p><div className="auth-trust"><ShieldCheck size={20} /><span>Your email. Your access.<br /><small>Verified before your workspace opens.</small></span></div></div><p className="text-sm opacity-60">TheAIPods · Business execution platform</p></section>
    <section className="wf-auth-form">
      {entering ? <div className="auth-welcome" role="status"><span><Check size={28} /></span><h2>You're in.</h2><p>Opening your workspace…</p></div> : <form onSubmit={e => { e.preventDefault(); void submit(); }} aria-busy={busy}>
        <p className="wf-eyebrow">{mode === "login" ? "Your workspace awaits" : purpose === "reset" ? "Account recovery" : "Your next chapter"}</p>
        {mode !== "login" && <ol className="auth-progress" aria-label="Account setup progress">{["Work email", "Verify", "Password"].map((label, i) => <li key={label} aria-current={(mode === "verify" ? 1 : mode === "password" ? 2 : 0) === i ? "step" : undefined}><span>{i + 1}</span>{label}</li>)}</ol>}
        <h1 ref={title} tabIndex={-1} className="auth-title">{heading}</h1>
        <p className="auth-description">{mode === "verify" ? <>Enter the six-digit code sent to <strong>{email}</strong>. It expires in 10 minutes.</> : mode === "password" ? <>Email verified. {purpose === "reset" ? "Your new password will replace the current one on this environment." : "Add your name and choose a password to enter your workspace."}</> : mode === "reset" ? "We'll send a verification code to your account's work email. Admins and workspace owners use the same secure process." : mode === "register" ? "Verify your company email, choose a password, and start building." : "Log in to pick up where your team left off."}</p>
        {error && <div className="auth-error" role="alert" key={errorVersion}><span className="auth-error-icon" aria-hidden="true"><Mail size={27} /><i><X size={13} strokeWidth={3} /></i></span><span>{error}</span></div>}
        {message && <Notice>{message}</Notice>}
        {mode === "login" && <div className="auth-portals" role="group" aria-label="Choose login area">{(["owner", "admin"] as const).map(value => <button key={value} type="button" disabled={busy} aria-pressed={portal === value} onClick={() => setPortal(value)}>{value === "owner" ? "Workspace login" : "Admin login"}</button>)}</div>}
        <fieldset disabled={busy} className="auth-fields">
          {["login", "register", "reset"].includes(mode) && <div className="wf-field"><label htmlFor="auth-email">Work email</label><input id="auth-email" name="email" type="email" autoComplete="username" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" /></div>}
          {mode === "verify" && <div className="wf-field"><label htmlFor="auth-code">Verification code</label><input id="auth-code" className="auth-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required placeholder="000000" /></div>}
          {mode === "password" && purpose === "signup" && <div className="wf-field"><label htmlFor="auth-name">Your name</label><input id="auth-name" name="name" autoComplete="name" maxLength={120} value={name} onChange={e => setName(e.target.value)} required /></div>}
          {(mode === "login" || mode === "password") && <div className="wf-field"><label htmlFor="auth-password">{mode === "login" ? "Password" : "New password"}</label><input id="auth-password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} required aria-describedby={mode === "password" ? "auth-password-hint" : undefined} />{mode === "password" && <p id="auth-password-hint" className="auth-hint">Use 10–128 characters. A long, unique passphrase works well.</p>}</div>}
          {mode === "password" && <div className="wf-field"><label htmlFor="auth-confirm">Confirm new password</label><input id="auth-confirm" name="confirm" type="password" autoComplete="new-password" maxLength={128} value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>}
          <Button type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : mode === "verify" ? "Verify email" : mode === "password" ? purpose === "reset" ? "Save new password" : "Create account & continue" : "Send verification code"}<ArrowRight size={17} /></Button>
        </fieldset>
        <div className="auth-links">{mode === "login" ? <><button type="button" disabled={busy} onClick={() => switchMode("register")}>Create account</button><button type="button" disabled={busy} onClick={() => switchMode("reset")}>Forgot password?</button></> : <><button type="button" disabled={busy} onClick={() => switchMode("login")}>Back to login</button>{mode === "verify" && <button type="button" disabled={busy || remaining > 0} onClick={() => void submit(true)}>{remaining > 0 ? `Resend in ${remaining}s` : "Resend code"}</button>}{(mode === "verify" || mode === "password") && <button type="button" disabled={busy} onClick={() => switchMode(purpose === "reset" ? "reset" : "register")}>Change email / start again</button>}</>}</div>
        <Link className="auth-back" href="/">← Back to website</Link>
      </form>}
    </section>
  </main>;
}
export function Welcome() {
  const s = usePlatform(); const router = useRouter();
  useEffect(() => { if (s.ready && !s.user) router.replace("/login"); }, [s.ready, s.user, router]);
  if (!s.ready || !s.user) return <div className="p-10">Loading your account…</div>;
  return <main className="max-w-5xl mx-auto w-full px-6 py-10"><Logo /><div className="py-16"><Heading eyebrow={`Welcome, ${s.user.name}`} title="Let’s teach your workforce how your business works.">Start by creating a company. Each company has its own knowledge, brand, processes and pods. You can add as many companies as you need.</Heading><div className="grid gap-6 sm:grid-cols-3 mb-10">{["Understand your business", "Map how work gets done", "Configure your workforce"].map((x, i) => <div className="wf-section" key={x}><span className="wf-number">0{i + 1}</span><h2 className="mt-4">{x}</h2><p className="text-sm text-muted">{["Capture goals, products, customers and teams.", "Document inputs, owners, handoffs and exceptions.", "Set rules, review recommendations and rehearse a pod."][i]}</p></div>)}</div><Link className="wf-button" href="/onboarding">+ Create a company</Link>{s.companies.length > 0 && <section className="mt-12"><h2 className="text-xl font-semibold mb-4">Your companies</h2>{s.companies.map(c => <Link key={c.id} href={c.status === "draft" ? `/onboarding?company=${c.id}` : "/workspace"} onClick={() => s.setActive(c.id)} className="wf-list-row"><span><b>{c.name}</b><small>{c.industry || "Onboarding in progress"}</small></span><span className="wf-badge">{c.status === "draft" ? "Resume onboarding →" : "Open workspace →"}</span></Link>)}</section>}</div></main>;
}
