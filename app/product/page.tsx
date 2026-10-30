import type { Metadata } from "next";
import { ProductExperience } from "@/components/ProductExperience";
import "../product-showcase.css";

export const metadata: Metadata = { title: "Product | TheAIPods", description: "Explore how AI Pod brings specialized employees, orchestration, connected tools, controls and deliverables together in one workforce platform.", alternates: { canonical: "/product" } };
export default function ProductPage() { return <ProductExperience/>; }
