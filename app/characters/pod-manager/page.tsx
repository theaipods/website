import Link from "next/link";
import { WorkerScene } from "@/components/WorkerScene";
import "./preview.css";

export const metadata = { title: "Pod Manager artwork | TheAIPods" };

export default function PodManagerPreview() {
  return <main className="pod-preview">
    <div className="pod-preview-shell">
      <Link href="/agents" className="pod-preview-back">← AI workforce</Link>
      <div className="pod-preview-grid">
        <div className="pod-preview-copy">
          <span className="pod-preview-label">CHARACTER REVIEW · 01 / 28</span>
          <h1>Pod Manager</h1>
          <p>The Pod Manager crowned lion from the approved workforce reference artwork.</p>
          <p className="pod-preview-note">This is visual artwork for review. It does not run a pod or show live activity.</p>
        </div>
        <div className="pod-preview-stage" aria-label="Pod Manager reference artwork">
          <WorkerScene role="orchestrator" characterId="pod-manager" />
          <span className="pod-preview-hint">STATIC REFERENCE ARTWORK</span>
        </div>
      </div>
    </div>
  </main>;
}
