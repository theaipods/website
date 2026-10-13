import type { Metadata } from "next";
import { IntegrationExperience } from "@/components/IntegrationExperience";
import "../integrations.css";
import "../integrations-redesign.css";

export const metadata: Metadata = {
  title: "AI Pod Integrations & MCP | Connect Your AI Workforce",
  description: "Connect AI Pod to the tools, business systems, APIs and MCP servers your AI workforce needs to execute real work.",
};

export default function IntegrationsPage() { return <IntegrationExperience/>; }
