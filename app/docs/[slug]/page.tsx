import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsExperience } from "@/components/DocsExperience";
import { docsArticles, docsBySlug } from "@/lib/docs-content";
export function generateStaticParams(){return docsArticles.map(article=>({slug:article.slug}))}
export async function generateMetadata({params}:PageProps<"/docs/[slug]">):Promise<Metadata>{const {slug}=await params;const article=docsBySlug[slug];return article?{title:`${article.title} | AI Pod Docs`,description:article.summary}:{title:"Guide not found"}}
export default async function Page({params}:PageProps<"/docs/[slug]">){const {slug}=await params;const article=docsBySlug[slug];if(!article)notFound();return <DocsExperience article={article}/>}
