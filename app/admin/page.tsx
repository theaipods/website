"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, ArrowLeft, ArrowUpRight, Building2, CalendarDays, ChevronRight, FileText, Globe2, Home, KeyRound, LayoutDashboard, LogOut, RefreshCw, Search, Settings, ShieldCheck, Users, Wallet } from "lucide-react";
import { api, usePlatform } from "@/components/platform-context";
import { Logo } from "@/components/ui";
import { AdminEventsPanel } from "./events/AdminEventsPanel";
import "./admin.css";
import "./owner-console.css";

type Person = { id: string; name: string; email: string; role: "admin" | "owner"; verified: number };
type Company = { id: string; name: string; website?: string; ownerId: string; ownerName: string; ownerEmail: string; status?: string };
type FileRow = { id: string; company_id: string; name: string; category: string; status: string };
type Overview = { users: Person[]; companies: Company[]; knowledge: FileRow[] };
const navigation = [
  { id: "overview", label: "Platform overview", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Users },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "files", label: "Files", icon: FileText },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "workspace", label: "Workspace", icon: Activity },
  { id: "admins", label: "Admin access", icon: ShieldCheck },
  { id: "plans", label: "Plan allowances", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
] as const;
type Tab = typeof navigation[number]["id"];
const descriptions: Record<Tab, string> = {
  overview: "A clear view of your accounts, companies and shared knowledge.",
  accounts: "People, access and the companies they own.",
  companies: "Your organizations, organized by their website.",
  files: "Choose a company to explore its uploaded knowledge.",
  events: "Manage sessions, speakers and registrations.",
  workspace: "Open your own workspace to review work and decisions.",
  admins: "Manage trusted access to platform-wide controls.",
  plans: "Assign account allowances. This does not collect payment.",
  settings: "Public website content and platform preferences.",
};
function website(company: Company) {
  const value = company.website?.trim();
  if (!value) return company.name;
  try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname; }
  catch { return value; }
}
function readTab(): Tab {
  const requested = new URLSearchParams(window.location.search).get("tab") || window.location.hash.slice(1);
  if (requested === "owners") return "accounts";
  return navigation.find(item => item.id === requested)?.id || "overview";
}

export default function AdminPage() {
  const platform = usePlatform();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Overview | null>(null);
  const [showTeam, setShowTeam] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [planEmail, setPlanEmail] = useState("");
  const [plan, setPlan] = useState("starter");
  useEffect(() => {
    const sync = () => { setTab(readTab()); setSearch(""); setCompanyId(null); setOwnerId(null); };
    sync(); window.addEventListener("popstate", sync); window.addEventListener("hashchange", sync);
    return () => { window.removeEventListener("popstate", sync); window.removeEventListener("hashchange", sync); };
  }, []);
  function navigate(next: Tab) {
    setTab(next); setSearch(""); setCompanyId(null); setOwnerId(null); setMessage("");
    window.history.pushState(null, "", next === "overview" ? "/admin" : `/admin?tab=${next}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function refresh() {
    const [overview, settings] = await Promise.all([api<Overview>("admin/overview"), api<{ showTeam: boolean }>("admin/settings")]);
    setData(overview); setShowTeam(settings.showTeam);
  }
  useEffect(() => {
    if (platform.ready && platform.user?.role === "admin") void refresh().catch(e => setError((e as Error).message));
  }, [platform.ready, platform.user?.role]);
  async function act(work: () => Promise<unknown>, success: string) {
    setBusy(true); setError(""); setMessage("");
    try { await work(); await refresh(); setMessage(success); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function reload() {
    setBusy(true); setError("");
    try { await refresh(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try { await api("auth/logout", "POST", {}); await platform.refresh(); router.push("/login"); }
    catch (e) { setError((e as Error).message); setBusy(false); }
  }
  function openFiles(id: string) { navigate("files"); setCompanyId(id); }
  const users = data?.users || [], companies = data?.companies || [], files = data?.knowledge || [];
  const selectedCompany = companies.find(c => c.id === companyId);
  const selectedOwner = users.find(u => u.id === ownerId);
  const needle = search.trim().toLowerCase();
  const matches = (...values: (string | undefined)[]) => values.join(" ").toLowerCase().includes(needle);
  const companyFiles = companyId ? files.filter(f => f.company_id === companyId) : files;
  const visibleCompanies = companies.filter(c => (!ownerId || c.ownerId === ownerId) && matches(c.name, website(c), c.ownerName, c.ownerEmail));
  const visibleFiles = companyFiles.filter(f => matches(f.name, f.category, f.status));
  const visibleUsers = users.filter(u => matches(u.name, u.email, u.role, ...companies.filter(c => c.ownerId === u.id).map(website)));
  const searchBox = (placeholder: string) => <label className="oc-search"><Search size={17}/><input type="search" aria-label={placeholder} placeholder={placeholder} value={search} onChange={e => setSearch(e.target.value)}/></label>;
  const companyDirectory = (list: Company[]) => <div className="oc-company-grid">{list.map(c => <button className="oc-company" key={c.id} onClick={() => openFiles(c.id)}><span className="oc-company-icon"><Globe2 size={23}/></span><span><strong>{website(c)}</strong><small>{c.name !== website(c) ? c.name : c.ownerName}</small><small>{files.filter(f => f.company_id === c.id).length} files · {c.status || "draft"}</small></span><ChevronRight size={18}/></button>)}{!list.length && <p className="oc-empty">{needle ? "No companies match your search." : "No companies yet."}</p>}</div>;
  if (!platform.ready) return <main className="admin-shell">Loading your console…</main>;
  if (platform.user?.role !== "admin") return <main className="admin-shell"><h1>Platform access required</h1><Link href="/login">Sign in with an authorized account</Link></main>;
  return <div className="owner-console">
    <aside className="oc-sidebar"><div className="oc-logo"><Logo href="/admin"/></div><p className="oc-overline">PLATFORM OWNER</p>
      <nav aria-label="Platform navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => navigate(id)}><Icon size={18}/>{label}{tab === id && <ChevronRight size={14}/>}</button>)}</nav>
      <div className="oc-account"><div><span className="oc-avatar">{platform.user.name.slice(0, 1).toUpperCase()}</span><span><strong>{platform.user.name}</strong><small>Platform administrator</small></span></div><Link href="/reset-password"><KeyRound size={16}/>Change password</Link><button disabled={busy} onClick={() => void logout()}><LogOut size={16}/>Log out</button></div>
    </aside>
    <main className="oc-main"><div className="oc-topline"><span>THEAIPODS <span>/</span> PLATFORM</span><span className="oc-access"><ShieldCheck size={14}/>Authorized access</span></div>
      <header className="oc-header"><div><h1>{navigation.find(n => n.id === tab)?.label}</h1><p>{descriptions[tab]}</p></div><div className="oc-actions">{tab === "overview" && <><Link href="/workspace"><Activity size={16}/>Workspace</Link><Link href="/"><Home size={16}/>Homepage</Link></>}<button disabled={busy} onClick={() => void reload()}><RefreshCw size={16}/>{busy ? "Working…" : "Refresh"}</button></div></header>
      {error && <p className="oc-notice error" role="alert">{error}</p>}{message && <p className="oc-notice" role="status">{message}</p>}
      {!data && !error && tab !== "events" && <p className="oc-empty" role="status">Loading platform records…</p>}
      {tab === "overview" && <>
        <section className="oc-metrics" aria-label="Platform totals">{[{ label: "Accounts", value: users.length, target: "accounts", icon: Users }, { label: "Companies", value: companies.length, target: "companies", icon: Building2 }, { label: "Uploaded files", value: files.length, target: "files", icon: FileText }, { label: "Administrators", value: users.filter(u => u.role === "admin").length, target: "admins", icon: ShieldCheck }].map(({ label, value, target, icon: Icon }) => <button key={label} onClick={() => navigate(target as Tab)}><span><Icon size={18}/>{label}<ArrowUpRight size={15}/></span><strong>{data ? value : " - "}</strong><small>View {label.toLowerCase()}</small></button>)}</section>
        <section className="oc-panel"><div className="oc-panel-heading"><div><h2>Owners and their companies</h2><p>Open an account to see its companies and uploaded files.</p></div><button className="oc-primary" onClick={() => navigate("accounts")}>Manage owners <ArrowUpRight size={16}/></button></div><div className="oc-table-wrap"><table><thead><tr><th>Account</th><th>Access</th><th>Companies</th><th>Files</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{users.slice(0, 6).map(u => { const owned = companies.filter(c => c.ownerId === u.id); return <tr key={u.id}><td><strong>{u.name}</strong><small>{u.email}</small></td><td><span className="oc-badge">{u.role}</span></td><td>{owned.length}</td><td>{files.filter(f => owned.some(c => c.id === f.company_id)).length}</td><td><button onClick={() => { navigate("accounts"); setOwnerId(u.id); }} aria-label={`View ${u.name}`}>View <ChevronRight size={15}/></button></td></tr>; })}</tbody></table></div>{data && !users.length && <p className="oc-empty">Accounts will appear here when people register.</p>}</section>
        <div className="oc-summary-links"><button onClick={() => navigate("settings")}><Settings size={20}/><span><strong>Website settings</strong><small>About content and homepage visibility</small></span><ChevronRight size={17}/></button><button onClick={() => navigate("plans")}><Wallet size={20}/><span><strong>Account allowances</strong><small>Review and assign plan access</small></span><ChevronRight size={17}/></button></div>
      </>}
      {tab === "accounts" && <section className="oc-panel"><div className="oc-panel-heading"><h2>{selectedOwner ? selectedOwner.name : "Account directory"}</h2>{searchBox("Search accounts and companies")}</div>{selectedOwner ? <><button className="oc-back" onClick={() => { setOwnerId(null); setSearch(""); }}><ArrowLeft size={16}/>All accounts</button><p className="oc-detail">{selectedOwner.email} · {selectedOwner.role} · {selectedOwner.verified ? "Verified" : "Unverified"}</p>{companyDirectory(visibleCompanies)}<button className="oc-back" onClick={() => { navigate("plans"); setPlanEmail(selectedOwner.email); }}>Manage plan allowance <ArrowUpRight size={15}/></button></> : <div className="oc-account-list">{visibleUsers.map(u => <button key={u.id} onClick={() => { setOwnerId(u.id); setSearch(""); }}><span className="oc-avatar">{u.name.slice(0, 1)}</span><span><strong>{u.name}</strong><small>{u.email}</small></span><span className="oc-badge">{u.role}</span><small>{companies.filter(c => c.ownerId === u.id).length} companies</small><ChevronRight size={16}/></button>)}{!visibleUsers.length && <p className="oc-empty">No matching accounts.</p>}</div>}</section>}
      {tab === "companies" && <section className="oc-panel"><div className="oc-panel-heading"><h2>Company directory</h2>{searchBox("Search company websites or owners")}</div>{companyDirectory(visibleCompanies)}</section>}
      {tab === "files" && <><section className="oc-file-summary"><div><strong>{data ? companyFiles.length : " - "}</strong><span>Uploaded files</span></div><div><strong>{data ? companyId ? 1 : companies.length : " - "}</strong><span>Companies</span></div><div><strong>{new Set(companyFiles.map(f => f.category)).size}</strong><span>Categories</span></div><div><strong>{companyFiles.filter(f => /pending|process/i.test(f.status)).length}</strong><span>Processing</span></div>{searchBox(companyId ? "Search this company’s files" : "Search company websites")}</section><section className="oc-panel"><div className="oc-panel-heading"><div><h2>{selectedCompany ? website(selectedCompany) : "Files by company"}</h2><p>{selectedCompany ? "Files uploaded to this company only." : "Select a website to view its files."}</p></div>{companyId && <button onClick={() => { setCompanyId(null); setSearch(""); }}><ArrowLeft size={16}/>All companies</button>}</div>{companyId ? <div className="oc-table-wrap"><table><thead><tr><th>File</th><th>Category</th><th>Status</th></tr></thead><tbody>{visibleFiles.map(f => <tr key={f.id}><td><span className="oc-file-name"><FileText size={17}/>{f.name}</span></td><td>{f.category}</td><td><span className="oc-badge">{f.status}</span></td></tr>)}</tbody></table>{!visibleFiles.length && <p className="oc-empty">{needle ? "No files match your search." : "No files uploaded to this company yet."}</p>}</div> : companyDirectory(visibleCompanies)}</section><p className="oc-footnote">Text indexing uses extracted document chunks and keyword matching. Embeddings are not currently enabled.</p></>}
      {tab === "events" && <AdminEventsPanel embedded/>}
      {tab === "workspace" && <section className="oc-panel"><h2>Your operational workspace</h2><p className="oc-detail">Review your company’s tasks, results and approval requests.</p><div className="oc-actions"><Link href="/workspace" className="oc-primary">Open workspace <ArrowUpRight size={16}/></Link><Link href="/workspace/approvals">Review decisions <ChevronRight size={16}/></Link></div></section>}
      {tab === "admins" && <section className="oc-panel"><h2>Administrator access</h2><p className="oc-detail">Add an existing, verified account. Administrators can manage platform records and public content.</p><form className="oc-form" onSubmit={e => { e.preventDefault(); void act(() => api("admin/users", "POST", { email }), "Admin access granted."); }}><label>Work email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@company.com"/></label><button className="oc-primary" disabled={busy}>Add admin</button></form><div className="oc-admin-list">{users.filter(u => u.role === "admin").map(u => <div key={u.id}><span><strong>{u.name}</strong><small>{u.email}</small></span>{u.id === platform.user!.id ? <span className="oc-badge">You</span> : <button disabled={busy} onClick={() => void act(() => api(`admin/users/${u.id}`, "DELETE"), "Admin access removed.")}>Remove access</button>}</div>)}</div></section>}
      {tab === "plans" && <section className="oc-panel"><h2>Account plan allowance</h2><p className="oc-detail">Accounts begin on Starter. Assigning an allowance does not charge the account.</p><form className="oc-form" onSubmit={e => { e.preventDefault(); void act(() => api("admin/plans", "POST", { email: planEmail, plan }), "Plan allowance updated."); }}><label>Account email<input required type="email" value={planEmail} onChange={e => setPlanEmail(e.target.value)} placeholder="founder@company.com"/></label><label>Plan<select value={plan} onChange={e => setPlan(e.target.value)}><option value="starter">Starter - 1 Pod / project</option><option value="founders">Founders - 10 Pods / projects</option><option value="enterprise">Enterprise - custom allowance</option></select></label><button className="oc-primary" disabled={busy}>Apply plan</button></form></section>}
      {tab === "settings" && <section className="oc-panel"><h2>Public website</h2><div className="oc-setting-row"><span><strong>About page</strong><small>Edit the existing story, team and published content.</small></span><Link href="/admin/about">Edit About <ArrowUpRight size={16}/></Link></div><div className="oc-setting-row"><span><strong>Homepage team</strong><small>Choose whether visitors can see the team section.</small></span><label className="oc-toggle"><input type="checkbox" checked={showTeam} disabled={busy} onChange={e => void act(() => api("admin/settings", "POST", { showTeam: e.target.checked }), "Homepage visibility updated.")}/>{showTeam ? "Visible" : "Hidden"}</label></div><div className="oc-setting-row"><span><strong>Events</strong><small>Manage public sessions from the Events section.</small></span><button onClick={() => navigate("events")}>Open Events <ArrowUpRight size={16}/></button></div></section>}
    </main>
  </div>;
}
