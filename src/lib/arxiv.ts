/** arXiv Atom enrich — abstracts for kept papers. Never a new lead. */

import type { PaperRow } from "./compile.ts";

const API = "https://export.arxiv.org/api/query";
const UA = "NEXUS-SAGE-desk/0.2 (free-ingest; arXiv Atom)";

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function field(block: string, tag: string) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decode(m[1]) : "";
}

export function parseArxivAtom(xml: string): { id: string; abstract: string }[] {
  return xml
    .split(/<entry[\s>]/i)
    .slice(1)
    .map((raw) => {
      const block = raw.split(/<\/entry>/i)[0] ?? raw;
      const idRaw = field(block, "id");
      const id = (idRaw.match(/(\d{4}\.\d{4,5})/) || [])[1] || "";
      return { id, abstract: field(block, "summary").slice(0, 800) };
    })
    .filter((r) => r.id && r.abstract);
}

function needsAbstract(p: PaperRow) {
  if (!p.keep) return false;
  const a = (p.abstract || "").trim();
  return !a || a === "HF daily_papers live row.";
}

export async function enrichPapers(papers: PaperRow[]): Promise<PaperRow[]> {
  const missing = papers.filter(needsAbstract).slice(0, 8);
  if (!missing.length) return papers;
  try {
    const ids = missing.map((p) => p.id).join(",");
    const r = await fetch(`${API}?id_list=${ids}&max_results=${missing.length}`, {
      headers: { Accept: "application/atom+xml", "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return papers;
    const rows = parseArxivAtom(await r.text());
    const map = new Map(rows.map((row) => [row.id, row.abstract]));
    return papers.map((p) => (map.has(p.id) ? { ...p, abstract: map.get(p.id) } : p));
  } catch {
    return papers;
  }
}
