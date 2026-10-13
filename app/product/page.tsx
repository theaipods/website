import type { Metadata } from "next";
import { ProductExperience } from "@/components/ProductExperience";

export const metadata: Metadata = { title: "Product | TheAI Pods", description: "Explore how AI Pod brings specialized employees, orchestration, connected tools, controls and deliverables together in one workforce platform.", alternates: { canonical: "/product" } };
export default function ProductPage() { return <ProductExperience/>; }
