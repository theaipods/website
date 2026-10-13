import Link from "next/link";
import { PreviousShowreel } from "@/components/PreviousShowreel";
import "../../future-home.css";
import "../../future-light.css";

export default function PreviousShowreelPage() {
  return <main className="future-home future-reel-page"><div className="fh-container"><div className="fh-section-head"><div><p className="fh-kicker">THE AI PODS / FILM ARCHIVE</p><h1>Previous showreel.</h1></div><Link href="/showreel" className="fh-link">← Current film</Link></div><PreviousShowreel/></div></main>;
}
