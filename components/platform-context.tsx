"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Business, Run, Capability } from "@/lib/workforce";

export async function api<T = unknown>(path: string, method = "GET", data?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, { method, headers: data instanceof FormData ? {} : { "Content-Type": "application/json" }, body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data), cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || (result.verificationRequired ? "Please verify your email. Use Verify email below." : "Request failed."));
  return result;
}
type Snapshot = { user: { id: string; name: string; email: string; role: "owner" | "admin" } | null; companies: Business[]; pods: Run[]; killed: boolean; providers: { capability: Capability; configured: boolean; model: string }[]; audit: { action: string; at: string; company_id: string | null }[] };
const empty: Snapshot = { user: null, companies: [], pods: [], killed: false, providers: [], audit: [] };
type Context = Snapshot & { ready: boolean; activeId: string; company?: Business; setActive: (id: string) => void; refresh: () => Promise<void>; error: string };
const Ctx = createContext<Context | null>(null);
export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const refreshVersion = useRef(0);
  const [state, setState] = useState(empty); const [ready, setReady] = useState(false); const [activeId, setActiveId] = useState(""); const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    try {
      const session = await api<{ user: Snapshot["user"] }>("auth/session");
      if (version !== refreshVersion.current) return;
      if (!session.user) { setState(empty); setActiveId(""); setError(""); return; }
      const data = await api<Snapshot>("state"); if (version !== refreshVersion.current) return; setState(data); setError("");
      setActiveId(previous => { let stored = ""; try { stored = sessionStorage.getItem(`company:${data.user?.id}`) || ""; } catch {} const selected = previous || stored; return data.companies.some(c => c.id === selected) ? selected : data.companies.find(c => c.status === "active")?.id || data.companies[0]?.id || ""; });
    } catch (e) { if (version === refreshVersion.current) setError(e instanceof Error ? e.message : "Unable to load workspace."); } finally { if (version === refreshVersion.current) setReady(true); }
  }, []);
  useEffect(() => { void refresh(); const changed = () => { void refresh(); }; window.addEventListener("workforce:changed", changed); const timer = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 4000); return () => { clearInterval(timer); window.removeEventListener("workforce:changed", changed); }; }, [refresh]);
  const setActive = (id: string) => { setActiveId(id); try { sessionStorage.setItem(`company:${state.user?.id}`, id); } catch {} };
  return <Ctx.Provider value={{ ...state, ready, error, activeId, company: state.companies.find(c => c.id === activeId), setActive, refresh }}>{children}</Ctx.Provider>;
}
export function usePlatform() { const c = useContext(Ctx); if (!c) throw new Error("Missing PlatformProvider"); return c; }
