import { createServerFn } from "@tanstack/react-start";
import { PAPERS } from "@/data/papers";
import { mapDailyPapers, type HfDailyRow } from "@/lib/hf-map";
import type { PaperRow } from "@/lib/compile";

export type LivePaper = PaperRow & { abstract?: string };
export type { HfDailyRow };
export { mapDailyPapers };

export const fetchDailyPapers = createServerFn({ method: "GET" }).handler(async (): Promise<LivePaper[]> => {
  try {
    const r = await fetch("https://huggingface.co/api/daily_papers", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return PAPERS;
    const raw = (await r.json()) as HfDailyRow[];
    const mapped = mapDailyPapers(Array.isArray(raw) ? raw : []);
    return mapped.length ? mapped : PAPERS;
  } catch {
    return PAPERS;
  }
});
