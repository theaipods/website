import type { Metadata } from "next";
import { BookDemoExperience } from "@/components/BookDemoExperience";
import "../book-demo-redesign.css";
import "../demo-possibilities.css";
import "../future-home.css";
import "../future-light.css";

export const metadata: Metadata = {
  title: "Book a Personalized AI Workforce Demo | TheAIPods",
  description: "Bring one business objective and see a personalized AI workforce plan, specialist Pod, workflow, tools, MCP connections and human checkpoints.",
  alternates: { canonical: "/book-demo" },
  openGraph: {
    title: "See your AI workforce in action | TheAIPods",
    description: "Book a personalized 30-minute walkthrough built around your business objective.",
    type: "website",
    url: "/book-demo",
  },
};

export default function BookDemoPage() {
  return <BookDemoExperience />;
}
