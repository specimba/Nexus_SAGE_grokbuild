import { createServerFn } from "@tanstack/react-start";

export type DeskStatus = {
  at: string;
  hf: { ok: boolean; papers: number; ms: number };
};

export const fetchDeskStatus = createServerFn({ method: "GET" }).handler(async (): Promise<DeskStatus> => {
  const t0 = Date.now();
  try {
    const r = await fetch("https://huggingface.co/api/daily_papers", {
      headers: { Accept: "application/json" },
    });
    const raw = r.ok ? ((await r.json()) as unknown[]) : [];
    return {
      at: new Date().toISOString(),
      hf: { ok: r.ok, papers: Array.isArray(raw) ? raw.length : 0, ms: Date.now() - t0 },
    };
  } catch {
    return { at: new Date().toISOString(), hf: { ok: false, papers: 0, ms: Date.now() - t0 } };
  }
});
