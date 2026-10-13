import type { Metadata } from "next";
import { AboutRedesign } from "@/components/AboutRedesign";
import { getAboutContent } from "@/lib/server/about";
import "../about-redesign.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "About AI Pod | The workforce we're building",
  description: "Why we're building AI Pod: specialized AI employees, coordinated work, connected tools and human accountability.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() { return <AboutRedesign content={await getAboutContent()} />; }
