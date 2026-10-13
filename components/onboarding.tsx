"use client";
import { useEffect, useState } from "react";
import type { Knowledge } from "@/lib/workforce";
import { api } from "./platform-context";
import { Button, Field, Notice } from "./platform-ui";

export function KnowledgePanel({ companyId, logo, onLogo, onFiles }: { companyId: string; logo?: string; onLogo?: (id: string) => void; onFiles?: (files: Knowledge[]) => void }) {
  const [files, setFiles] = useState<Knowledge[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [category, setCategory] = useState("Company information");
  useEffect(() => { void api<Knowledge[]>(`companies/${companyId}/knowledge`).then(setFiles).catch(e => setError(e.message)); }, [companyId]);
  useEffect(() => { onFiles?.(files); }, [files, onFiles]);
  async function upload(list: FileList | null) {
    if (!list) return; setBusy(true); setError("");
    try { for (const file of Array.from(list)) { const data = new FormData(); data.append("file", file); data.append("category", category); setFiles(await api<Knowledge[]>(`companies/${companyId}/knowledge`, "POST", data)); } } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <><Notice>Files are stored privately for this company. TXT, Markdown, CSV, JSON, PDF, DOCX and PPTX are text-indexed when readable. Other formats are retained for future extraction / vision adapters. Embeddings are not enabled yet.</Notice>{error && <Notice error>{error}</Notice>}<div className="grid sm:grid-cols-2 gap-5 items-end"><Field label="Knowledge category" value={category} onChange={setCategory} options={["Company information", "Brand guidelines", "Product knowledge", "Customer information", "Engineering standards", "SOPs", "Sales playbooks", "Pricing", "HR policies", "Finance records", "Legal policies", "Logo"]} /><label className="wf-upload">{busy ? "Uploading…" : "Choose files or drop them here"}<input aria-label="Upload company documents" type="file" multiple disabled={busy} accept=".txt,.md,.csv,.json,.pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.webp" onChange={e => void upload(e.target.files)} /><small>Up to 8 MB per file · 100 files per company</small></label></div><div className="mt-6">{files.map(f => <div key={f.id} className="wf-list-row"><span><a className="font-medium" href={`/api/knowledge/${f.id}`}>{f.name} ↗</a><small>{f.category} · {(f.size / 1024).toFixed(0)} KB · {f.status} · {f.chunks} chunks</small></span><div className="flex gap-2">{onLogo && f.type.startsWith("image/") && <Button secondary onClick={() => onLogo(f.id)}>{logo === f.id ? "Logo selected" : "Use as logo"}</Button>}<button className="text-sm text-red-700" onClick={async () => { if (!confirm(`Remove ${f.name}?`)) return; try { await api(`knowledge/${f.id}`, "DELETE"); setFiles(files.filter(x => x.id !== f.id)); if (logo === f.id) onLogo?.(""); } catch (e) { setError((e as Error).message); } }}>Remove</button></div></div>)}</div></>;
}

export { Blueprint } from './business-blueprint';
export { OnboardingFlow } from './onboarding-flow';


