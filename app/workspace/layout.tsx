import Link from "next/link";
import { WorkspaceShell } from "@/components/workforce-workspace";
export default function Layout({children}: {children: React.ReactNode}) { return <WorkspaceShell><Link href="/workspace/demo" className="wf-button secondary mb-6">Explore five ready-to-send demo briefs →</Link>{children}</WorkspaceShell>; }
