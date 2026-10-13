import Link from "next/link";
import { FutureShowreel } from "@/components/FutureShowreel";
import "../future-home.css";
import "../future-light.css";

export default function ShowreelPage() {
  return <main className="future-home future-reel-page"><div className="fh-container"><div className="fh-section-head"><div><p className="fh-kicker">AI POD / CINEMATIC DEMO</p><h1>A workforce, in motion.</h1><p>One objective becomes coordinated, validated work. Fictional demonstration.</p></div><Link href="/" className="fh-link">← Back home</Link></div><FutureShowreel /><div className="fh-reel-actions"><Link href="/showreel/previous" className="fh-link">Previous film ↗</Link><Link href="/showreel/legacy" className="fh-link">Original showreel ↗</Link></div></div></main>;
}
