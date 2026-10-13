import { aboutSchema, defaultAboutContent, type AboutContent } from "@/lib/about-content";
import { db } from "@/lib/server/db";

export async function getAboutContent(): Promise<AboutContent> {
  const row = await db().one("SELECT value FROM site_settings WHERE key='about_content'");
  if (!row) return defaultAboutContent;
  try { return aboutSchema.parse(JSON.parse(String(row.value))); }
  catch { return defaultAboutContent; }
}

export async function saveAboutContent(input: unknown): Promise<AboutContent> {
  const value = aboutSchema.parse(input);
  await db().query("INSERT INTO site_settings(key,value) VALUES('about_content',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [JSON.stringify(value)]);
  return value;
}
