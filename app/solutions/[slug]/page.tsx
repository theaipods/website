import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionDetail } from "@/components/SolutionsExperience";
import { FinanceOperationsRedesign } from "@/components/FinanceOperationsRedesign";
import { EmployeeExperienceRedesign } from "@/components/EmployeeExperienceRedesign";
import { SalesMarketingRedesign } from "@/components/SalesMarketingRedesign";
import { HealthcareRedesign } from "@/components/HealthcareRedesign";
import { InsuranceRedesign } from "@/components/InsuranceRedesign";
import { solutions, solutionBySlug } from "@/lib/solutions";
import "../../finance-operations-redesign.css";
import "../../employee-experience-redesign.css";
import "../../sales-marketing-redesign.css";
import "../../healthcare-redesign.css";
import "../../insurance-redesign.css";
export function generateStaticParams(){return solutions.map(item=>({slug:item.slug}))}
export async function generateMetadata({params}:PageProps<"/solutions/[slug]">):Promise<Metadata>{const {slug}=await params;const item=solutionBySlug[slug];return item?{title:`${item.title} Solutions | TheAI Pods`,description:item.description}:{title:"Solution not found"}}
export default async function Page({params}:PageProps<"/solutions/[slug]">){const {slug}=await params;const item=solutionBySlug[slug];if(!item)notFound();if(slug==="finance-operations")return <FinanceOperationsRedesign item={item}/>;if(slug==="employee-experience")return <EmployeeExperienceRedesign item={item}/>;if(slug==="sales-marketing")return <SalesMarketingRedesign item={item}/>;if(slug==="healthcare")return <HealthcareRedesign item={item}/>;if(slug==="insurance")return <InsuranceRedesign item={item}/>;return <SolutionDetail item={item}/>}
