import { keepPaper } from "./keep.ts";
import type { PaperRow } from "./compile.ts";

export type HfDailyRow = {
  paper?: { id?: string; title?: string; summary?: string; upvotes?: number };
  title?: string;
  summary?: string;
  upvotes?: number;
};

export function mapDailyPapers(raw: HfDailyRow[]): PaperRow[] {
  return raw.slice(0, 24).map((row) => {
    const id = (row.paper?.id ?? "").replace(/^arxiv:/, "") || "unknown";
    const title = row.paper?.title ?? row.title ?? id;
    const up = row.paper?.upvotes ?? row.upvotes ?? 0;
    return {
      id,
      title,
      up,
      keep: keepPaper(id, title),
      abstract: (row.paper?.summary ?? row.summary ?? "").slice(0, 420) || "HF daily_papers live row.",
      href: `https://arxiv.org/abs/${id}`,
    };
  });
}
