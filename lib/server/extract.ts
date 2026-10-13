import { unzipSync, strFromU8 } from "fflate";

// Read only document text parts, never execute macros or follow relationships.
export function officeText(buffer: Uint8Array, extension: "docx" | "pptx") {
  let expanded = 0;
  const parts = unzipSync(buffer, { filter: file => {
    const selected = extension === "docx" ? /^word\/(document|header\d+|footer\d+)\.xml$/.test(file.name) : /^ppt\/(slides\/slide\d+|notesSlides\/notesSlide\d+)\.xml$/.test(file.name);
    if (!selected) return false;
    expanded += file.originalSize;
    if (file.originalSize > 10_000_000 || expanded > 40_000_000) throw new Error("Document expanded size exceeds extraction limit");
    return true;
  } });
  const decode = (value: string) => value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) => {
    const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
    if (!entity.startsWith("#")) return named[entity] || "";
    const code = entity.startsWith("#x") ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
  });
  return Object.entries(parts).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([name, bytes]) => {
    const xml = strFromU8(bytes).replace(/<\/(?:w|a):p>/g, "\n");
    const fragments = [...xml.matchAll(/<(?:w|a):t(?:\s[^>]*)?>([^<]*)<\/(?:w|a):t>|\n/g)].map(m => m[1] === undefined ? "\n" : decode(m[1]));
    const text = fragments.join("").trim();
    return text ? `${name}\n${text}` : "";
  }).join("\n\n");
}
