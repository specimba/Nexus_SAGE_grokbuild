import { compileDigest, renderEdition } from "./compile.ts";

export const CADENCE_MS = 6 * 60 * 60 * 1000;
export const PACK_KEY = "sage-digest-last";

export function nextDue(lastIso: string | null, now = Date.now()) {
  if (!lastIso) return { due: true, nextAt: new Date(now).toISOString(), ageH: Infinity };
  const last = Date.parse(lastIso);
  const next = last + CADENCE_MS;
  return { due: now >= next, nextAt: new Date(next).toISOString(), ageH: (now - last) / 3_600_000 };
}

export function renderHumanBrief(at = new Date().toISOString()) {
  return renderEdition(compileDigest({ at }));
}

export function compileFromLive(
  papers: { id: string; title: string; keep: boolean; up?: number; href?: string }[],
  at = new Date().toISOString(),
) {
  const rows = papers.map((p) => ({
    id: p.id,
    title: p.title,
    keep: p.keep,
    up: p.up ?? 0,
    href: p.href ?? `https://arxiv.org/abs/${p.id}`,
  }));
  return renderEdition(compileDigest({ papers: rows, at }));
}
