"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, usePlatform } from "@/components/platform-context";
import "./admin.css";

type Person = { id: string; name: string; email: string; role: "admin" | "owner"; verified: number };
type Company = { id: string; name: string; ownerId: string; ownerName: string; ownerEmail: string; status?: string };
type Pod = { id: string; name: string; companyId: string; ownerId: string; status?: string; tasks?: unknown[]; result?: string };
type FileRow = { id: string; company_id: string; name: string; category: string; status: string };
type Overview = { users: Person[]; companies: Company[]; pods: Pod[]; knowledge: FileRow[] };

export default function AdminPage() {
  const platform = usePlatform();
  const [data, setData] = useState<Overview | null>(null);
  const [showTeam, setShowTeam] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const [overview, settings] = await Promise.all([api<Overview>("admin/overview"), api<{ showTeam: boolean }>("admin/settings")]);
    setData(overview); setShowTeam(settings.showTeam);
  }
  useEffect(() => {
    if (!platform.ready || platform.user?.role !== "admin") return;
    void refresh().catch(e => setError((e as Error).message));
  }, [platform.ready, platform.user?.role]);
  async function act(work: () => Promise<unknown>, success: string) {
    setBusy(true); setError(""); setMessage("");
    try { await work(); await refresh(); setMessage(success); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  if (!platform.ready) return <main className="admin-shell">Loading…</main>;
  if (platform.user?.role !== "admin") return <main className="admin-shell"><h1>Admin access required</h1><Link href="/login">Log in as an admin</Link></main>;
  return <main className="admin-shell">
    <header className="admin-header"><div><p className="admin-kicker">THE AI PODS / ADMIN</p><h1>Platform overview</h1><p>Every owner, company, pod and work item in one place.</p></div><div><Link href="/admin/about">Edit About</Link><Link href="/admin/events">Manage events</Link><Link href="/workspace">My workspace</Link><Link href="/">Homepage</Link><button onClick={() => void refresh()}>Refresh</button></div></header>
    {error && <p className="admin-notice error" role="alert">{error}</p>}{message && <p className="admin-notice" role="status">{message}</p>}
    <div className="admin-stats"><div><strong>{data?.users.length ?? "—"}</strong><span>Accounts</span></div><div><strong>{data?.companies.length ?? "—"}</strong><span>Companies</span></div><div><strong>{data?.pods.length ?? "—"}</strong><span>Pods</span></div><div><strong>{data?.knowledge.length ?? "—"}</strong><span>Files</span></div></div>
    <section className="admin-card"><div className="admin-card-head"><div><h2>Homepage team</h2><p>The team section stays hidden for everyone until an admin enables it.</p></div><label className="admin-toggle"><input type="checkbox" checked={showTeam} disabled={busy} onChange={e => void act(() => api("admin/settings", "POST", { showTeam: e.target.checked }), e.target.checked ? "Team is now visible." : "Team is now hidden.")}/><span>{showTeam ? "Visible" : "Hidden"}</span></label></div></section>
    <section className="admin-card"><div className="admin-card-head"><div><h2>Admins</h2><p>Add a partner after they register and verify their account.</p></div></div><form className="admin-add" onSubmit={e => { e.preventDefault(); void act(() => api("admin/users", "POST", { email }), "Admin access granted."); setEmail(""); }}><input type="email" required placeholder="partner@example.com" value={email} onChange={e => setEmail(e.target.value)}/><button disabled={busy}>Add admin</button></form><div className="admin-list">{data?.users.filter(u => u.role === "admin").map(u => <div key={u.id}><span><strong>{u.name}</strong><small>{u.email}</small></span>{u.id !== platform.user?.id && <button disabled={busy} onClick={() => void act(() => api(`admin/users/${u.id}`, "DELETE"), "Admin access removed.")}>Remove access</button>}</div>)}</div></section>
    <section className="admin-card"><h2>Owners and their work</h2><div className="admin-owner-grid">{data?.users.map(owner => { const companies = data.companies.filter(c => c.ownerId === owner.id); const pods = data.pods.filter(p => p.ownerId === owner.id); return <article key={owner.id}><div className="admin-owner-top"><div><h3>{owner.name}</h3><p>{owner.email}</p></div><span>{owner.role}</span></div><p className="admin-owner-count">{companies.length} companies · {pods.length} pods</p>{companies.map(company => <details key={company.id}><summary><strong>{company.name}</strong><span>{company.status || "draft"}</span></summary><div className="admin-company-detail"><p>{data.knowledge.filter(k => k.company_id === company.id).length} knowledge files</p>{pods.filter(p => p.companyId === company.id).map(pod => <details key={pod.id}><summary>{pod.name} · {pod.status || "New"}</summary><div className="admin-pod-detail"><p>Tasks: {pod.tasks?.length || 0}</p>{pod.tasks?.map((task, index) => <pre key={index}>{JSON.stringify(task, null, 2)}</pre>)}{pod.result && <pre>{pod.result}</pre>}</div></details>)}</div></details>)}</article>; })}</div></section>
  </main>;
}
