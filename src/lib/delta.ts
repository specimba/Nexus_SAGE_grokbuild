import type { Edition } from "./compile.ts";

export type DeltaItem = {
  outlet: string;
  title: string;
  href?: string;
  at?: string;
};

export type PullDelta = {
  newWires: DeltaItem[];
  newPapers: { id: string; title: string; href?: string }[];
  newHn: DeltaItem[];
  goneWires: number;
};

export const EMPTY_DELTA: PullDelta = { newWires: [], newPapers: [], newHn: [], goneWires: 0 };

export function titleKey(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 64);
}

export function diffPull(prev: Edition | null | undefined, next: Edition): PullDelta {
  if (!prev?.wiresKeep?.length && !prev?.papersKeep?.length) return EMPTY_DELTA;
  const prevW = new Set(prev.wiresKeep.map((w) => titleKey(w.title)));
  const prevP = new Set(prev.papersKeep.map((p) => p.id));
  const prevH = new Set(prev.hn.map((h) => titleKey(h.title)));
  const nextW = new Set(next.wiresKeep.map((w) => titleKey(w.title)));
  return {
    newWires: next.wiresKeep
      .filter((w) => w.title && !prevW.has(titleKey(w.title)))
      .slice(0, 10)
      .map((w) => ({ outlet: w.outlet, title: w.title, href: w.href, at: w.at })),
    newPapers: next.papersKeep
      .filter((p) => p.id && !prevP.has(p.id))
      .slice(0, 8)
      .map((p) => ({ id: p.id, title: p.title, href: p.href })),
    newHn: next.hn
      .filter((h) => h.title && !prevH.has(titleKey(h.title)))
      .slice(0, 6)
      .map((h) => ({ outlet: `${h.points} pts`, title: h.title, href: h.href, at: h.at })),
    goneWires: prev.wiresKeep.filter((w) => !nextW.has(titleKey(w.title))).length,
  };
}
